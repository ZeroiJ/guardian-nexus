/**
 * Destiny 2 Manifest Processor Service
 * Handles hash-to-text resolution, manifest downloads, and definition caching
 */

import BungieAPIService from './bungieAPI';

/**
 * Manifest Processor Service
 * Provides comprehensive hash resolution and manifest data management
 */
export class ManifestProcessorService {
  constructor() {
    this.manifestCache = new Map();
    this.definitionCache = new Map();
    this.manifestVersion = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the manifest processor
   * Downloads and processes the latest manifest
   */
  async initialize() {
    try {
      await this.downloadManifestInfo();
      await this.processManifestData();
      this.isInitialized = true;
      console.log('Manifest Processor initialized successfully');
    } catch (error) {
      console.error('Failed to initialize manifest processor:', error);
      throw error;
    }
  }

  /**
   * Download manifest information from Bungie API
   */
  async downloadManifestInfo() {
    try {
      const manifestInfo = await this.makeApiRequest('/api/destiny2/manifest?action=info');
      this.manifestVersion = manifestInfo.version;
      this.manifestUrls = manifestInfo.jsonWorldComponentContentPaths;
      
      console.log('Downloaded manifest info:', {
        version: this.manifestVersion,
        languages: Object.keys(this.manifestUrls)
      });
    } catch (error) {
      throw new Error(`Failed to download manifest info: ${error.message}`);
    }
  }

  /**
   * Process manifest data for hash-to-definition mapping
   * @param {string} language - Language code (default: 'en')
   */
  async processManifestData(language = 'en') {
    if (!this.manifestUrls || !this.manifestUrls[language]) {
      throw new Error(`Manifest data not available for language: ${language}`);
    }

    try {
      // Download the full manifest for the specified language
      const manifestUrl = `https://www.bungie.net${this.manifestUrls[language]}`;
      const manifestData = await this.downloadManifestFile(manifestUrl);
      
      // Process each definition type
      for (const [entityType, definitions] of Object.entries(manifestData)) {
        this.processEntityDefinitions(entityType, definitions);
      }
      
      console.log(`Processed manifest data for ${language}:`, {
        entityTypes: Object.keys(manifestData).length,
        totalDefinitions: this.definitionCache.size
      });
    } catch (error) {
      throw new Error(`Failed to process manifest data: ${error.message}`);
    }
  }

  /**
   * Download manifest file from Bungie CDN
   * @param {string} url - Manifest file URL
   */
  async downloadManifestFile(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to download manifest file: ${error.message}`);
    }
  }

  /**
   * Process entity definitions into cache
   * @param {string} entityType - Type of entity (e.g., 'DestinyInventoryItemDefinition')
   * @param {Object} definitions - Raw definitions from manifest
   */
  processEntityDefinitions(entityType, definitions) {
    for (const [hash, definition] of Object.entries(definitions)) {
      // Convert hash to both signed and unsigned representations
      const signedHash = parseInt(hash);
      const unsignedHash = signedHash >>> 0;
      
      // Create processed definition with resolved text
      const processedDefinition = this.processDefinition(definition);
      
      // Cache with both hash representations as keys
      const cacheKey = `${entityType}:${signedHash}`;
      const unsignedCacheKey = `${entityType}:${unsignedHash}`;
      
      this.definitionCache.set(cacheKey, processedDefinition);
      this.definitionCache.set(unsignedCacheKey, processedDefinition);
    }
  }

  /**
   * Process individual definition to resolve hash references
   * @param {Object} definition - Raw definition object
   */
  processDefinition(definition) {
    // Clone the definition to avoid modifying the original
    const processed = JSON.parse(JSON.stringify(definition));
    
    // Resolve displayProperties if present
    if (processed.displayProperties) {
      processed.displayProperties = this.resolveDisplayProperties(processed.displayProperties);
    }

    // Resolve common hash references
    processed.resolvedHashes = {};
    
    // Resolve item category hashes
    if (processed.itemCategoryHashes) {
      processed.resolvedHashes.itemCategories = processed.itemCategoryHashes.map(hash => 
        this.resolveHash('DestinyItemCategoryDefinition', hash)
      ).filter(Boolean);
    }

    // Resolve damage type hash
    if (processed.defaultDamageTypeHash) {
      processed.resolvedHashes.damageType = this.resolveHash('DestinyDamageTypeDefinition', processed.defaultDamageTypeHash);
    }

    // Resolve stat hashes
    if (processed.stats?.stats) {
      processed.resolvedHashes.stats = {};
      for (const [statHash, statData] of Object.entries(processed.stats.stats)) {
        const statDefinition = this.resolveHash('DestinyStatDefinition', statHash);
        if (statDefinition) {
          processed.resolvedHashes.stats[statHash] = {
            definition: statDefinition,
            value: statData.value,
            maximum: statData.maximum
          };
        }
      }
    }

    return processed;
  }

  /**
   * Resolve displayProperties object
   * @param {Object} displayProperties - Display properties object
   */
  resolveDisplayProperties(displayProperties) {
    if (!displayProperties) return null;
    
    return {
      name: displayProperties.name || 'Unknown',
      description: displayProperties.description || '',
      icon: displayProperties.icon ? `https://www.bungie.net${displayProperties.icon}` : null,
      hasIcon: displayProperties.hasIcon || false,
      iconWatermark: displayProperties.iconWatermark ? `https://www.bungie.net${displayProperties.iconWatermark}` : null,
      iconWatermarkShelved: displayProperties.iconWatermarkShelved ? `https://www.bungie.net${displayProperties.iconWatermarkShelved}` : null,
      screenshot: displayProperties.screenshot ? `https://www.bungie.net${displayProperties.screenshot}` : null
    };
  }

  /**
   * Resolve a hash to its definition
   * @param {string} entityType - Entity type
   * @param {number|string} hash - Hash to resolve
   */
  resolveHash(entityType, hash) {
    if (!hash) return null;
    
    // Convert to both signed and unsigned and try both
    const signedHash = parseInt(hash);
    const unsignedHash = signedHash >>> 0;
    
    const signedKey = `${entityType}:${signedHash}`;
    const unsignedKey = `${entityType}:${unsignedHash}`;
    
    return this.definitionCache.get(signedKey) || this.definitionCache.get(unsignedKey) || null;
  }

  /**
   * Get definition by hash with full text resolution
   * @param {string} entityType - Entity type
   * @param {number|string} hash - Hash to look up
   * @returns {Object|null} Resolved definition with text
   */
  async getDefinition(entityType, hash) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const definition = this.resolveHash(entityType, hash);
    if (!definition) {
      // Fallback to API call if not in cache
      try {
        const apiDefinition = await this.makeApiRequest(`/api/destiny2/manifest?action=entity&entityType=${entityType}&hashId=${hash}`);
        const processedDefinition = this.processDefinition(apiDefinition);
        
        // Cache the result
        const cacheKey = `${entityType}:${hash}`;
        this.definitionCache.set(cacheKey, processedDefinition);
        
        return processedDefinition;
      } catch (error) {
        console.warn(`Failed to fetch definition for ${entityType}:${hash}:`, error.message);
        return null;
      }
    }

    return definition;
  }

  /**
   * Batch resolve multiple hashes
   * @param {string} entityType - Entity type
   * @param {Array<number|string>} hashes - Array of hashes
   * @returns {Object} Map of hash to resolved definition
   */
  async batchGetDefinitions(entityType, hashes) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const results = {};
    const uncachedHashes = [];

    // Check cache first
    for (const hash of hashes) {
      const definition = this.resolveHash(entityType, hash);
      if (definition) {
        results[hash] = definition;
      } else {
        uncachedHashes.push(hash);
      }
    }

    // Fetch uncached definitions
    if (uncachedHashes.length > 0) {
      try {
        const batchResponse = await this.makeApiRequest(
          `/api/destiny2/manifest?action=batch&entityType=${entityType}&hashIds=${uncachedHashes.join(',')}`
        );
        
        if (batchResponse.results) {
          for (const [hash, rawDefinition] of Object.entries(batchResponse.results)) {
            const processedDefinition = this.processDefinition(rawDefinition);
            results[hash] = processedDefinition;
            
            // Cache for future use
            const cacheKey = `${entityType}:${hash}`;
            this.definitionCache.set(cacheKey, processedDefinition);
          }
        }
      } catch (error) {
        console.warn('Batch definition fetch failed:', error.message);
      }
    }

    return results;
  }

  /**
   * Search for items by name or text
   * @param {string} entityType - Entity type to search
   * @param {string} searchTerm - Search term
   * @param {number} limit - Maximum results
   */
  async searchDefinitions(entityType, searchTerm, limit = 10) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Try API search first
    try {
      return await this.makeApiRequest(
        `/api/destiny2/manifest?action=search&entityType=${entityType}&searchTerm=${encodeURIComponent(searchTerm)}&limit=${limit}`
      );
    } catch (error) {
      // Fallback to cache search
      const results = [];
      const searchLower = searchTerm.toLowerCase();
      
      for (const [key, definition] of this.definitionCache.entries()) {
        if (!key.startsWith(`${entityType}:`)) continue;
        
        const name = definition.displayProperties?.name?.toLowerCase() || '';
        const description = definition.displayProperties?.description?.toLowerCase() || '';
        
        if (name.includes(searchLower) || description.includes(searchLower)) {
          results.push(definition);
          if (results.length >= limit) break;
        }
      }
      
      return results;
    }
  }

  /**
   * Make API request with error handling
   * @private
   */
  async makeApiRequest(endpoint) {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    const data = await response.json();
    return data.data || data;
  }

  /**
   * Clear cache and reset processor
   */
  clearCache() {
    this.manifestCache.clear();
    this.definitionCache.clear();
    this.isInitialized = false;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      manifestVersion: this.manifestVersion,
      definitionCount: this.definitionCache.size,
      isInitialized: this.isInitialized,
      memoryUsage: this.definitionCache.size * 50 // Rough estimate in KB
    };
  }
}

// Create singleton instance
const manifestProcessor = new ManifestProcessorService();

export default manifestProcessor;