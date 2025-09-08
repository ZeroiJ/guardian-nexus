/**
 * Destiny 2 Character Endpoint
 * Fetches detailed character data, equipment, and inventory for specific characters
 */

const { setupCORS, makeBungieRequest, createSuccessResponse } = require('../utils/bungie-client');
const { requireMembership } = require('../utils/auth-middleware');
const { withErrorHandler, createValidationError } = require('../utils/error-handler');
const { PROFILE_COMPONENTS } = require('./profile');

/**
 * Character-specific component sets
 */
const CHARACTER_COMPONENT_SETS = {
  basic: [
    PROFILE_COMPONENTS.Characters,
    PROFILE_COMPONENTS.CharacterEquipment
  ],
  equipment: [
    PROFILE_COMPONENTS.Characters,
    PROFILE_COMPONENTS.CharacterEquipment,
    PROFILE_COMPONENTS.CharacterInventories,
    PROFILE_COMPONENTS.ItemInstances,
    PROFILE_COMPONENTS.ItemStats,
    PROFILE_COMPONENTS.ItemSockets
  ],
  progression: [
    PROFILE_COMPONENTS.Characters,
    PROFILE_COMPONENTS.CharacterProgressions,
    PROFILE_COMPONENTS.CharacterActivities,
    PROFILE_COMPONENTS.Records,
    PROFILE_COMPONENTS.Collectibles
  ],
  complete: [
    PROFILE_COMPONENTS.Characters,
    PROFILE_COMPONENTS.CharacterEquipment,
    PROFILE_COMPONENTS.CharacterInventories,
    PROFILE_COMPONENTS.CharacterProgressions,
    PROFILE_COMPONENTS.CharacterActivities,
    PROFILE_COMPONENTS.CharacterRenderData,
    PROFILE_COMPONENTS.ItemInstances,
    PROFILE_COMPONENTS.ItemStats,
    PROFILE_COMPONENTS.ItemSockets,
    PROFILE_COMPONENTS.ItemPerks,
    PROFILE_COMPONENTS.Records,
    PROFILE_COMPONENTS.Collectibles
  ]
};

/**
 * Equipment slot mappings
 */
const EQUIPMENT_SLOTS = {
  0: { name: 'Kinetic Weapon', category: 'weapon', type: 'kinetic' },
  1: { name: 'Energy Weapon', category: 'weapon', type: 'energy' },
  2: { name: 'Power Weapon', category: 'weapon', type: 'power' },
  3: { name: 'Helmet', category: 'armor', type: 'helmet' },
  4: { name: 'Gauntlets', category: 'armor', type: 'gauntlets' },
  5: { name: 'Chest Armor', category: 'armor', type: 'chest' },
  6: { name: 'Leg Armor', category: 'armor', type: 'legs' },
  7: { name: 'Class Item', category: 'armor', type: 'class' },
  8: { name: 'Ghost', category: 'equipment', type: 'ghost' },
  9: { name: 'Vehicle', category: 'equipment', type: 'vehicle' },
  10: { name: 'Ship', category: 'equipment', type: 'ship' },
  11: { name: 'Shader', category: 'cosmetic', type: 'shader' },
  12: { name: 'Emblem', category: 'cosmetic', type: 'emblem' },
  13: { name: 'Emote', category: 'cosmetic', type: 'emote' },
  14: { name: 'Finisher', category: 'cosmetic', type: 'finisher' }
};

/**
 * Parse components parameter for character requests
 * @param {string|Array} components - Components parameter
 * @returns {Array<number>} Array of component IDs
 */
function parseCharacterComponents(components) {
  if (!components) {
    return CHARACTER_COMPONENT_SETS.basic;
  }
  
  if (typeof components === 'string') {
    if (CHARACTER_COMPONENT_SETS[components.toLowerCase()]) {
      return CHARACTER_COMPONENT_SETS[components.toLowerCase()];
    }
    
    return components.split(',').map(comp => {
      const trimmed = comp.trim();
      const componentId = parseInt(trimmed);
      
      if (!isNaN(componentId)) {
        return componentId;
      }
      
      const componentName = Object.keys(PROFILE_COMPONENTS).find(
        name => name.toLowerCase() === trimmed.toLowerCase()
      );
      
      if (componentName) {
        return PROFILE_COMPONENTS[componentName];
      }
      
      throw createValidationError(`Invalid component: ${trimmed}`);
    });
  }
  
  if (Array.isArray(components)) {
    return components.map(comp => {
      const componentId = parseInt(comp);
      if (isNaN(componentId)) {
        throw createValidationError(`Invalid component ID: ${comp}`);
      }
      return componentId;
    });
  }
  
  throw createValidationError('Components must be a string, array, or predefined set name');
}

/**
 * Fetch character data from Destiny 2 API
 * @param {string} membershipType - Platform membership type
 * @param {string} membershipId - Platform membership ID
 * @param {string} characterId - Character ID
 * @param {Array<number>} components - Profile components to fetch
 * @param {string} accessToken - OAuth access token
 * @returns {Promise<Object>} Character data
 */
async function getCharacterData(membershipType, membershipId, characterId, components, accessToken) {
  const componentsParam = components.join(',');
  const endpoint = `/Destiny2/${membershipType}/Profile/${membershipId}/Character/${characterId}/?components=${componentsParam}`;
  
  const response = await makeBungieRequest(endpoint, { accessToken });
  
  if (!response.Response) {
    throw new Error('Failed to retrieve character data');
  }
  
  return response.Response;
}

/**
 * Enhance character data with computed information
 * @param {Object} characterData - Raw character data
 * @param {string} characterId - Character ID
 * @returns {Object} Enhanced character data
 */
function enhanceCharacterData(characterData, characterId) {
  const enhanced = { ...characterData };
  
  // Add character summary
  if (enhanced.character && enhanced.character.data) {
    const char = enhanced.character.data;
    enhanced.characterSummary = {
      characterId: characterId,
      classType: char.classType,
      className: getClassName(char.classType),
      raceType: char.raceType,
      raceName: getRaceName(char.raceType),
      genderType: char.genderType,
      genderName: getGenderName(char.genderType),
      powerLevel: char.light,
      level: char.levelProgression?.level || 0,
      lastPlayed: char.dateLastPlayed,
      minutesPlayedTotal: char.minutesPlayedTotal,
      emblemPath: char.emblemPath,
      emblemBackgroundPath: char.emblemBackgroundPath,
      titleRecordHash: char.titleRecordHash
    };
  }
  
  // Enhance equipment data
  if (enhanced.equipment && enhanced.equipment.data && enhanced.equipment.data.items) {
    enhanced.equipmentSummary = {
      totalItems: enhanced.equipment.data.items.length,
      itemsBySlot: {},
      weaponPowerLevels: [],
      armorPowerLevels: []
    };
    
    enhanced.equipment.data.items.forEach(item => {
      const slotInfo = EQUIPMENT_SLOTS[item.bucketHash] || { name: 'Unknown', category: 'unknown' };
      
      enhanced.equipmentSummary.itemsBySlot[item.bucketHash] = {
        ...slotInfo,
        itemHash: item.itemHash,
        itemInstanceId: item.itemInstanceId,
        quantity: item.quantity
      };
      
      // Track power levels for weapons and armor
      if (enhanced.itemComponents && enhanced.itemComponents.instances && 
          enhanced.itemComponents.instances.data && 
          enhanced.itemComponents.instances.data[item.itemInstanceId]) {
        const instance = enhanced.itemComponents.instances.data[item.itemInstanceId];
        if (instance.primaryStat) {
          if (slotInfo.category === 'weapon') {
            enhanced.equipmentSummary.weaponPowerLevels.push(instance.primaryStat.value);
          } else if (slotInfo.category === 'armor') {
            enhanced.equipmentSummary.armorPowerLevels.push(instance.primaryStat.value);
          }
        }
      }
    });
  }
  
  // Add progression summary
  if (enhanced.progressions && enhanced.progressions.data) {
    enhanced.progressionSummary = {
      totalProgressions: Object.keys(enhanced.progressions.data.progressions).length,
      completedProgressions: Object.values(enhanced.progressions.data.progressions)
        .filter(prog => prog.level >= prog.levelCap).length,
      seasonalRank: enhanced.progressions.data.seasonalArtifact?.powerBonus || 0
    };
  }
  
  return enhanced;
}

/**
 * Get class name from class type
 * @param {number} classType - Class type ID
 * @returns {string} Class name
 */
function getClassName(classType) {
  const classes = { 0: 'Titan', 1: 'Hunter', 2: 'Warlock' };
  return classes[classType] || 'Unknown';
}

/**
 * Get race name from race type
 * @param {number} raceType - Race type ID
 * @returns {string} Race name
 */
function getRaceName(raceType) {
  const races = { 0: 'Human', 1: 'Awoken', 2: 'Exo' };
  return races[raceType] || 'Unknown';
}

/**
 * Get gender name from gender type
 * @param {number} genderType - Gender type ID
 * @returns {string} Gender name
 */
function getGenderName(genderType) {
  const genders = { 0: 'Male', 1: 'Female' };
  return genders[genderType] || 'Unknown';
}

/**
 * Main handler for character endpoint
 * @param {Object} req - Vercel request object
 * @param {Object} res - Vercel response object
 * @param {Object} auth - Authentication data from middleware
 * @returns {Object} Character data response
 */
async function handler(req, res, auth) {
  // Setup CORS
  setupCORS(res);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    throw createValidationError('Method not allowed. Use GET.', { allowedMethods: ['GET'] });
  }
  
  const { membershipType, membershipId, characterId, components } = req.query;
  
  // Validate required parameters
  if (!characterId) {
    throw createValidationError('characterId is required');
  }
  
  try {
    // Parse and validate components
    const componentIds = parseCharacterComponents(components);
    
    // Fetch character data
    const characterData = await getCharacterData(
      membershipType,
      membershipId,
      characterId,
      componentIds,
      auth.accessToken
    );
    
    // Enhance character data
    const enhancedCharacter = enhanceCharacterData(characterData, characterId);
    
    return createSuccessResponse(res, {
      character: enhancedCharacter,
      membershipType: parseInt(membershipType),
      membershipId: membershipId,
      characterId: characterId,
      componentsRequested: componentIds,
      requestedAt: new Date().toISOString()
    }, 'Character data retrieved successfully');
    
  } catch (error) {
    // Re-throw to be handled by error handler
    throw error;
  }
}

// Export handler wrapped with membership validation and error handling
module.exports = requireMembership(withErrorHandler(handler));

// Export constants for external use
module.exports.CHARACTER_COMPONENT_SETS = CHARACTER_COMPONENT_SETS;
module.exports.EQUIPMENT_SLOTS = EQUIPMENT_SLOTS;