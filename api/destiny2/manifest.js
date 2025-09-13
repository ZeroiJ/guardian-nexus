/**
 * Destiny 2 Manifest Endpoint
 * Handles manifest data retrieval and item definition lookups
 */

const { applyCorsHeaders, handleCorsPrelight, makeBungieRequest, createSuccessResponse, validateEnvironment } = require('../utils/bungie-client');
const { withErrorHandler, createValidationError } = require('../utils/error-handler');

/**
 * Available manifest entity types
 */
const MANIFEST_ENTITIES = {
  // Items and Equipment
  DestinyInventoryItemDefinition: 'Items and equipment definitions',
  DestinyInventoryBucketDefinition: 'Inventory bucket definitions',
  DestinyItemCategoryDefinition: 'Item category definitions',
  DestinyItemTierTypeDefinition: 'Item tier type definitions',
  DestinyDamageTypeDefinition: 'Damage type definitions',
  
  // Classes and Progression
  DestinyClassDefinition: 'Character class definitions',
  DestinyRaceDefinition: 'Character race definitions',
  DestinyGenderDefinition: 'Character gender definitions',
  DestinyProgressionDefinition: 'Progression definitions',
  DestinyFactionDefinition: 'Faction definitions',
  
  // Activities and Destinations
  DestinyActivityDefinition: 'Activity definitions',
  DestinyActivityTypeDefinition: 'Activity type definitions',
  DestinyDestinationDefinition: 'Destination definitions',
  DestinyPlaceDefinition: 'Place definitions',
  
  // Vendors and Rewards
  DestinyVendorDefinition: 'Vendor definitions',
  DestinyRewardSourceDefinition: 'Reward source definitions',
  
  // Collectibles and Records
  DestinyCollectibleDefinition: 'Collectible definitions',
  DestinyRecordDefinition: 'Triumph record definitions',
  DestinyPresentationNodeDefinition: 'Presentation node definitions',
  
  // Stats and Perks
  DestinyStatDefinition: 'Stat definitions',
  DestinySandboxPerkDefinition: 'Sandbox perk definitions',
  DestinySocketTypeDefinition: 'Socket type definitions',
  DestinyPlugSetDefinition: 'Plug set definitions',
  
  // Seasons and Events
  DestinySeasonDefinition: 'Season definitions',
  DestinyEventCardDefinition: 'Event card definitions',
  
  // Miscellaneous
  DestinyMilestoneDefinition: 'Milestone definitions',
  DestinyObjectiveDefinition: 'Objective definitions',
  DestinyAchievementDefinition: 'Achievement definitions'
};

/**
 * Get manifest information
 * @returns {Promise<Object>} Manifest metadata
 */
async function getManifestInfo() {
  const response = await makeBungieRequest('/Destiny2/Manifest/');
  
  if (!response.Response) {
    throw new Error('Failed to retrieve manifest information');
  }
  
  return response.Response;
}

/**
 * Get entity definition by hash
 * @param {string} entityType - Entity type (e.g., 'DestinyInventoryItemDefinition')
 * @param {string|number} hashId - Hash ID of the entity
 * @param {string} language - Language code (default: 'en')
 * @returns {Promise<Object>} Entity definition
 */
async function getEntityDefinition(entityType, hashId, language = 'en') {
  // Validate entity type
  if (!MANIFEST_ENTITIES[entityType]) {
    throw createValidationError(`Invalid entity type: ${entityType}. Available types: ${Object.keys(MANIFEST_ENTITIES).join(', ')}`);
  }
  
  // Convert hash to unsigned 32-bit integer if needed
  let hash = hashId;
  if (typeof hash === 'string') {
    hash = parseInt(hash);
  }
  
  // Convert signed to unsigned if negative
  if (hash < 0) {
    hash = hash >>> 0;
  }
  
  const endpoint = `/Destiny2/Manifest/${entityType}/${hash}/`;
  const response = await makeBungieRequest(endpoint);
  
  if (!response.Response) {
    throw new Error(`Entity not found: ${entityType} with hash ${hashId}`);
  }
  
  return response.Response;
}

/**
 * Search for entities by name or properties
 * @param {string} entityType - Entity type to search
 * @param {string} searchTerm - Search term
 * @param {number} limit - Maximum results to return (default: 10, max: 50)
 * @returns {Promise<Array>} Array of matching entities
 */
async function searchEntities(entityType, searchTerm, limit = 10) {
  // Validate entity type
  if (!MANIFEST_ENTITIES[entityType]) {
    throw createValidationError(`Invalid entity type: ${entityType}`);
  }
  
  // Limit validation
  const maxLimit = Math.min(parseInt(limit) || 10, 50);
  
  const endpoint = `/Destiny2/Armory/Search/${entityType}/${encodeURIComponent(searchTerm)}/`;
  const response = await makeBungieRequest(endpoint);
  
  if (!response.Response || !response.Response.results) {
    return [];
  }
  
  return response.Response.results.slice(0, maxLimit);
}

/**
 * Get multiple entity definitions in batch
 * @param {string} entityType - Entity type
 * @param {Array<string|number>} hashIds - Array of hash IDs
 * @param {string} language - Language code
 * @returns {Promise<Object>} Object with hash IDs as keys and definitions as values
 */
async function getBatchEntityDefinitions(entityType, hashIds, language = 'en') {
  if (!Array.isArray(hashIds) || hashIds.length === 0) {
    throw createValidationError('hashIds must be a non-empty array');
  }
  
  if (hashIds.length > 20) {
    throw createValidationError('Maximum 20 entities can be requested in a single batch');
  }
  
  const results = {};
  const errors = [];
  
  // Process requests in parallel but limit concurrency
  const promises = hashIds.map(async (hashId) => {
    try {
      const definition = await getEntityDefinition(entityType, hashId, language);
      results[hashId] = definition;
    } catch (error) {
      errors.push({ hashId, error: error.message });
    }
  });
  
  await Promise.all(promises);
  
  return {
    results,
    errors: errors.length > 0 ? errors : undefined,
    totalRequested: hashIds.length,
    totalFound: Object.keys(results).length
  };
}

/**
 * Main handler for manifest endpoint
 * @param {Object} req - Vercel request object
 * @param {Object} res - Vercel response object
 * @returns {Object} Manifest data response
 */
async function handler(req, res) {
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
  
  // Validate environment
  validateEnvironment();
  
  const { 
    action = 'info', 
    entityType, 
    hashId, 
    hashIds, 
    searchTerm, 
    language = 'en', 
    limit = 10 
  } = req.query;
  
  try {
    let responseData;
    let message;
    
    switch (action.toLowerCase()) {
      case 'info':
        responseData = await getManifestInfo();
        message = 'Manifest information retrieved successfully';
        break;
        
      case 'entity':
        if (!entityType || !hashId) {
          throw createValidationError('entityType and hashId are required for entity lookup');
        }
        responseData = await getEntityDefinition(entityType, hashId, language);
        message = `Entity definition retrieved successfully`;
        break;
        
      case 'batch':
        if (!entityType || !hashIds) {
          throw createValidationError('entityType and hashIds are required for batch lookup');
        }
        
        let hashArray;
        if (typeof hashIds === 'string') {
          hashArray = hashIds.split(',').map(id => id.trim());
        } else if (Array.isArray(hashIds)) {
          hashArray = hashIds;
        } else {
          throw createValidationError('hashIds must be a comma-separated string or array');
        }
        
        responseData = await getBatchEntityDefinitions(entityType, hashArray, language);
        message = `Batch entity definitions retrieved successfully`;
        break;
        
      case 'search':
        if (!entityType || !searchTerm) {
          throw createValidationError('entityType and searchTerm are required for search');
        }
        responseData = await searchEntities(entityType, searchTerm, limit);
        message = `Search completed successfully`;
        break;
        
      case 'types':
        responseData = {
          availableEntityTypes: Object.keys(MANIFEST_ENTITIES).map(type => ({
            type,
            description: MANIFEST_ENTITIES[type]
          })),
          totalTypes: Object.keys(MANIFEST_ENTITIES).length
        };
        message = 'Available entity types retrieved successfully';
        break;
        
      default:
        throw createValidationError(`Invalid action: ${action}. Available actions: info, entity, batch, search, types`);
    }
    
    return createSuccessResponse(res, {
      action,
      data: responseData,
      requestedAt: new Date().toISOString(),
      language: language
    }, message);
    
  } catch (error) {
    // Re-throw to be handled by error handler
    throw error;
  }
}

// Export handler wrapped with error handling
module.exports = withErrorHandler(handler);

// Export constants for external use
module.exports.MANIFEST_ENTITIES = MANIFEST_ENTITIES;