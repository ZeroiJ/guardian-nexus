/**
 * Destiny 2 Profile Endpoint
 * Fetches comprehensive Destiny 2 profile data for authenticated users
 */

const { applyCorsHeaders, handleCorsPrelight, makeBungieRequest, createSuccessResponse } = require('../utils/bungie-client');
const { requireMembership, getPrimaryMembership } = require('../utils/auth-middleware');
const { withErrorHandler, createValidationError } = require('../utils/error-handler');

/**
 * Available Destiny 2 profile components
 * Each component represents different aspects of a player's profile
 */
const PROFILE_COMPONENTS = {
  Profiles: 100,
  VendorReceipts: 101,
  ProfileInventories: 102,
  ProfileCurrencies: 103,
  ProfileProgression: 104,
  PlatformSilver: 105,
  Characters: 200,
  CharacterInventories: 201,
  CharacterProgressions: 202,
  CharacterRenderData: 203,
  CharacterActivities: 204,
  CharacterEquipment: 205,
  ItemInstances: 300,
  ItemObjectives: 301,
  ItemPerks: 302,
  ItemRenderData: 303,
  ItemStats: 304,
  ItemSockets: 305,
  ItemTalentGrids: 306,
  ItemCommonData: 307,
  ItemPlugStates: 308,
  ItemPlugObjectives: 309,
  ItemReusablePlugs: 310,
  Kiosks: 400,
  CurrencyLookups: 401,
  PresentationNodes: 402,
  Collectibles: 403,
  Records: 404,
  Transitory: 500,
  Metrics: 600,
  StringVariables: 700,
  Craftables: 800,
  SocialCommendations: 900
};

/**
 * Default component sets for different use cases
 */
const COMPONENT_SETS = {
  basic: [
    PROFILE_COMPONENTS.Profiles,
    PROFILE_COMPONENTS.Characters,
    PROFILE_COMPONENTS.CharacterEquipment
  ],
  detailed: [
    PROFILE_COMPONENTS.Profiles,
    PROFILE_COMPONENTS.Characters,
    PROFILE_COMPONENTS.CharacterInventories,
    PROFILE_COMPONENTS.CharacterEquipment,
    PROFILE_COMPONENTS.CharacterProgressions,
    PROFILE_COMPONENTS.ProfileInventories,
    PROFILE_COMPONENTS.ProfileCurrencies,
    PROFILE_COMPONENTS.ItemInstances,
    PROFILE_COMPONENTS.ItemStats
  ],
  complete: Object.values(PROFILE_COMPONENTS)
};

/**
 * Parse components parameter from request
 * @param {string|Array} components - Components parameter
 * @returns {Array<number>} Array of component IDs
 */
function parseComponents(components) {
  if (!components) {
    return COMPONENT_SETS.basic;
  }
  
  if (typeof components === 'string') {
    // Handle predefined component sets
    if (COMPONENT_SETS[components.toLowerCase()]) {
      return COMPONENT_SETS[components.toLowerCase()];
    }
    
    // Handle comma-separated component IDs or names
    return components.split(',').map(comp => {
      const trimmed = comp.trim();
      const componentId = parseInt(trimmed);
      
      if (!isNaN(componentId)) {
        return componentId;
      }
      
      // Try to find by name
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
 * Fetch Destiny 2 profile data
 * @param {string} membershipType - Platform membership type
 * @param {string} membershipId - Platform membership ID
 * @param {Array<number>} components - Profile components to fetch
 * @param {string} accessToken - OAuth access token
 * @returns {Promise<Object>} Profile data
 */
async function getDestinyProfile(membershipType, membershipId, components, accessToken) {
  const componentsParam = components.join(',');
  const endpoint = `/Destiny2/${membershipType}/Profile/${membershipId}/?components=${componentsParam}`;
  
  const response = await makeBungieRequest(endpoint, { accessToken });
  
  if (!response.Response) {
    throw new Error('Failed to retrieve Destiny profile data');
  }
  
  return response.Response;
}

/**
 * Enhance profile data with additional computed information
 * @param {Object} profileData - Raw profile data from Bungie API
 * @returns {Object} Enhanced profile data
 */
function enhanceProfileData(profileData) {
  const enhanced = { ...profileData };
  
  // Add character summary information
  if (enhanced.characters && enhanced.characters.data) {
    enhanced.characterSummary = {
      totalCharacters: Object.keys(enhanced.characters.data).length,
      maxPowerLevel: Math.max(
        ...Object.values(enhanced.characters.data).map(char => char.light || 0)
      ),
      classes: Object.values(enhanced.characters.data).map(char => ({
        characterId: char.characterId,
        classType: char.classType,
        className: getClassName(char.classType),
        raceType: char.raceType,
        raceName: getRaceName(char.raceType),
        genderType: char.genderType,
        genderName: getGenderName(char.genderType),
        powerLevel: char.light,
        level: char.levelProgression?.level || 0,
        lastPlayed: char.dateLastPlayed,
        minutesPlayedTotal: char.minutesPlayedTotal
      }))
    };
  }
  
  // Add profile statistics
  if (enhanced.profile && enhanced.profile.data) {
    enhanced.profileStats = {
      lastPlayed: enhanced.profile.data.dateLastPlayed,
      totalPlayTime: enhanced.characterSummary?.classes.reduce(
        (total, char) => total + (char.minutesPlayedTotal || 0), 0
      ) || 0,
      versionsOwned: enhanced.profile.data.versionsOwned,
      characterSlots: enhanced.profile.data.characterSlots || 3
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
 * Main handler for profile endpoint
 * @param {Object} req - Vercel request object
 * @param {Object} res - Vercel response object
 * @param {Object} auth - Authentication data from middleware
 * @returns {Object} Profile data response
 */
async function handler(req, res, auth) {
  // Setup CORS
  applyCorsHeaders(res);
  
  // Handle preflight requests
  const corsResponse = handleCorsPrelight(req, res);
  if (corsResponse) {
    return corsResponse;
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    throw createValidationError('Method not allowed. Use GET.', { allowedMethods: ['GET'] });
  }
  
  const { membershipType, membershipId, components } = req.query;
  
  try {
    // Parse and validate components
    const componentIds = parseComponents(components);
    
    // If no specific membership provided, use primary membership
    let targetMembershipType = membershipType;
    let targetMembershipId = membershipId;
    
    if (!targetMembershipType || !targetMembershipId) {
      const primaryMembership = getPrimaryMembership(auth.memberships);
      if (!primaryMembership) {
        throw createValidationError('No Destiny memberships found for this user');
      }
      
      targetMembershipType = primaryMembership.membershipType;
      targetMembershipId = primaryMembership.membershipId;
    }
    
    // Fetch profile data
    const profileData = await getDestinyProfile(
      targetMembershipType,
      targetMembershipId,
      componentIds,
      auth.accessToken
    );
    
    // Enhance profile data
    const enhancedProfile = enhanceProfileData(profileData);
    
    return createSuccessResponse(res, {
      profile: enhancedProfile,
      membershipType: parseInt(targetMembershipType),
      membershipId: targetMembershipId,
      componentsRequested: componentIds,
      requestedAt: new Date().toISOString()
    }, 'Destiny profile retrieved successfully');
    
  } catch (error) {
    // Re-throw to be handled by error handler
    throw error;
  }
}

// Export handler wrapped with membership validation and error handling
module.exports = requireMembership(withErrorHandler(handler));

// Export component constants for external use
module.exports.PROFILE_COMPONENTS = PROFILE_COMPONENTS;
module.exports.COMPONENT_SETS = COMPONENT_SETS;