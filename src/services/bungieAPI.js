import { BungieAuthService } from './bungieAuth';

/**
 * Bungie API Service
 * Provides methods to interact with various Bungie.net API endpoints
 */
export class BungieAPIService {
  /**
   * Gets user's Destiny profile with specified components
   * @param {number} membershipType - Platform type
   * @param {string} membershipId - Platform membership ID 
   * @param {Array<number>} components - Component types to fetch
   * @returns {Promise<Object>} Profile data
   */
  static async getProfile(membershipType, membershipId, components = [100, 200, 201]) {
    const componentsStr = components?.join(',');
    return await BungieAuthService?.apiRequest(
      `/Destiny2/${membershipType}/Profile/${membershipId}/?components=${componentsStr}`
    );
  }

  /**
   * Gets character inventory and equipment
   * @param {number} membershipType - Platform type
   * @param {string} membershipId - Platform membership ID
   * @param {string} characterId - Character ID
   * @returns {Promise<Object>} Character data with inventory
   */
  static async getCharacter(membershipType, membershipId, characterId) {
    return await BungieAuthService?.apiRequest(
      `/Destiny2/${membershipType}/Profile/${membershipId}/Character/${characterId}/?components=200,201,205,300,302,304,305,310`
    );
  }

  /**
   * Gets vault contents
   * @param {number} membershipType - Platform type
   * @param {string} membershipId - Platform membership ID
   * @returns {Promise<Object>} Vault inventory data
   */
  static async getVault(membershipType, membershipId) {
    return await BungieAuthService?.apiRequest(
      `/Destiny2/${membershipType}/Profile/${membershipId}/?components=102`
    );
  }

  /**
   * Gets item manifest definition
   * @param {string} entityType - Entity type (e.g., 'DestinyInventoryItemDefinition')
   * @param {number} hashIdentifier - Item hash
   * @returns {Promise<Object>} Item definition
   */
  static async getManifestEntity(entityType, hashIdentifier) {
    return await BungieAuthService?.apiRequest(
      `/Destiny2/Manifest/${entityType}/${hashIdentifier}/`
    );
  }

  /**
   * Gets activity history for a character
   * @param {number} membershipType - Platform type
   * @param {string} membershipId - Platform membership ID
   * @param {string} characterId - Character ID
   * @param {number} count - Number of activities to return
   * @param {number} mode - Activity mode filter
   * @returns {Promise<Object>} Activity history
   */
  static async getActivityHistory(membershipType, membershipId, characterId, count = 25, mode = 0) {
    return await BungieAuthService?.apiRequest(
      `/Destiny2/${membershipType}/Account/${membershipId}/Character/${characterId}/Stats/Activities/?count=${count}&mode=${mode}`
    );
  }

  /**
   * Gets clan information for user
   * @param {number} membershipType - Platform type
   * @param {string} membershipId - Platform membership ID
   * @returns {Promise<Object>} Clan data
   */
  static async getClan(membershipType, membershipId) {
    return await BungieAuthService?.apiRequest(
      `/GroupV2/User/${membershipType}/${membershipId}/0/1/`
    );
  }

  /**
   * Gets seasonal progress and rewards
   * @param {number} membershipType - Platform type
   * @param {string} membershipId - Platform membership ID
   * @param {string} characterId - Character ID
   * @returns {Promise<Object>} Seasonal data
   */
  static async getSeasonalData(membershipType, membershipId, characterId) {
    return await BungieAuthService?.apiRequest(
      `/Destiny2/${membershipType}/Profile/${membershipId}/Character/${characterId}/?components=104,301,302,1100`
    );
  }

  /**
   * Gets triumph records and collections
   * @param {number} membershipType - Platform type
   * @param {string} membershipId - Platform membership ID
   * @returns {Promise<Object>} Records and collections
   */
  static async getRecordsAndCollections(membershipType, membershipId) {
    return await BungieAuthService?.apiRequest(
      `/Destiny2/${membershipType}/Profile/${membershipId}/?components=900,800`
    );
  }

  /**
   * Gets vendor data
   * @param {number} membershipType - Platform type
   * @param {string} membershipId - Platform membership ID
   * @param {string} characterId - Character ID
   * @returns {Promise<Object>} Vendor information
   */
  static async getVendors(membershipType, membershipId, characterId) {
    return await BungieAuthService?.apiRequest(
      `/Destiny2/${membershipType}/Profile/${membershipId}/Character/${characterId}/Vendors/?components=400,401,402`
    );
  }

  /**
   * Gets milestones and objectives
   * @param {number} membershipType - Platform type
   * @param {string} membershipId - Platform membership ID
   * @returns {Promise<Object>} Milestones data
   */
  static async getMilestones(membershipType, membershipId) {
    return await BungieAuthService?.apiRequest(
      `/Destiny2/${membershipType}/Profile/${membershipId}/?components=202`
    );
  }

  /**
   * Searches for Destiny players
   * @param {string} displayName - Player display name
   * @param {number} membershipType - Platform type (-1 for all)
   * @returns {Promise<Array>} Search results
   */
  static async searchDestinyPlayer(displayName, membershipType = -1) {
    return await BungieAuthService?.apiRequest(
      `/Destiny2/SearchDestinyPlayer/${membershipType}/${encodeURIComponent(displayName)}/`
    );
  }

  /**
   * Gets stats for specific activities
   * @param {number} membershipType - Platform type
   * @param {string} membershipId - Platform membership ID
   * @param {string} characterId - Character ID
   * @returns {Promise<Object>} Character stats
   */
  static async getCharacterStats(membershipType, membershipId, characterId) {
    return await BungieAuthService?.apiRequest(
      `/Destiny2/${membershipType}/Account/${membershipId}/Character/${characterId}/Stats/`
    );
  }

  /**
   * Gets loadouts for a character (if available)
   * @param {number} membershipType - Platform type
   * @param {string} membershipId - Platform membership ID
   * @param {string} characterId - Character ID
   * @returns {Promise<Object>} Loadout data
   */
  static async getLoadouts(membershipType, membershipId, characterId) {
    return await BungieAuthService?.apiRequest(
      `/Destiny2/${membershipType}/Profile/${membershipId}/Character/${characterId}/?components=600`
    );
  }

  /**
   * Gets detailed item information with sockets and stats
   * @param {number} membershipType - Platform type
   * @param {string} membershipId - Platform membership ID
   * @param {string} itemInstanceId - Specific item instance ID
   * @returns {Promise<Object>} Detailed item data
   */
  static async getItemDetail(membershipType, membershipId, itemInstanceId) {
    return await BungieAuthService?.apiRequest(
      `/Destiny2/${membershipType}/Profile/${membershipId}/Item/${itemInstanceId}/?components=300,301,302,304,305,306,307,308,309,310`
    );
  }

  /**
   * Helper method to get user's primary membership
   * @returns {Promise<Object>} Primary membership data
   */
  static async getPrimaryMembership() {
    const memberships = await BungieAuthService?.getDestinyMemberships();
    
    // Return the primary membership or the first available one
    return memberships?.destinyMemberships?.find(m => m?.crossSaveOverride === m?.membershipType) ||
           memberships?.destinyMemberships?.[0] ||
           null;
  }

  /**
   * Helper method to get all characters for primary membership
   * @returns {Promise<Object>} Characters data
   */
  static async getAllCharacters() {
    const membership = await this.getPrimaryMembership();
    if (!membership) {
      throw new Error('No Destiny membership found');
    }

    return await this.getProfile(
      membership?.membershipType, 
      membership?.membershipId, 
      [100, 200, 201, 205]
    );
  }

  /**
   * Checks if Bungie API is available and user is connected
   * @returns {Promise<Object>} Status object
   */
  static async getConnectionStatus() {
    try {
      const isConnected = await BungieAuthService?.isConnected();
      if (!isConnected) {
        return { connected: false, error: 'Not connected to Bungie.net' };
      }

      const membership = await this.getPrimaryMembership();
      return {
        connected: true,
        membership: membership || null,
        hasDestinyData: !!membership
      };
    } catch (error) {
      return { 
        connected: false, 
        error: error?.message || 'Connection check failed' 
      };
    }
  }
}

export default BungieAPIService;