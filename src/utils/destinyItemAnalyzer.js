/**
 * Destiny 2 Item Analyzer Utility
 * Provides comprehensive item analysis with hash resolution and text decoding
 */

import manifestProcessor from '../services/manifestProcessor';

/**
 * Destiny Item Analyzer Service
 * Analyzes items, weapons, armor with full hash resolution
 */
export class DestinyItemAnalyzer {
  constructor() {
    this.itemTypeMap = {
      1: 'Weapon',
      2: 'Armor',
      3: 'Ghost',
      4: 'Vehicle',
      7: 'Emblem',
      8: 'Emote',
      9: 'Ship',
      10: 'Sparrow',
      11: 'ClanBanner',
      12: 'Aura',
      13: 'Mod',
      14: 'Consumable',
      15: 'ExchangeMaterial',
      16: 'MissionReward',
      17: 'Currency'
    };

    this.damageTypeMap = {
      1: 'Kinetic',
      2: 'Arc',
      3: 'Solar',
      4: 'Void',
      5: 'Raid',
      6: 'Stasis',
      7: 'Strand'
    };

    this.rarityMap = {
      2: 'Common',
      3: 'Uncommon',
      4: 'Rare',
      5: 'Legendary',
      6: 'Exotic'
    };
  }

  /**
   * Analyze a complete item with all hash resolutions
   * @param {Object} itemData - Raw item data from API
   * @param {Object} itemDefinition - Item definition (optional, will fetch if not provided)
   */
  async analyzeItem(itemData, itemDefinition = null) {
    try {
      // Get item definition if not provided
      if (!itemDefinition && itemData.itemHash) {
        itemDefinition = await manifestProcessor.getDefinition('DestinyInventoryItemDefinition', itemData.itemHash);
      }

      if (!itemDefinition) {
        throw new Error('Unable to resolve item definition');
      }

      const analysis = {
        basic: this.analyzeBasicProperties(itemData, itemDefinition),
        sockets: await this.analyzeSockets(itemData, itemDefinition),
        stats: await this.analyzeStats(itemData, itemDefinition),
        perks: await this.analyzePerks(itemData, itemDefinition),
        categories: await this.analyzeCategories(itemDefinition),
        requirements: this.analyzeRequirements(itemDefinition),
        quality: await this.analyzeQuality(itemData, itemDefinition),
        metadata: this.analyzeMetadata(itemDefinition)
      };

      return analysis;
    } catch (error) {
      console.error('Item analysis failed:', error);
      return {
        error: error.message,
        itemHash: itemData?.itemHash,
        basic: this.analyzeBasicProperties(itemData, itemDefinition || {})
      };
    }
  }

  /**
   * Analyze basic item properties
   */
  analyzeBasicProperties(itemData, itemDefinition) {
    const basic = {
      hash: itemData?.itemHash || itemDefinition?.hash,
      name: itemDefinition?.displayProperties?.name || 'Unknown Item',
      description: itemDefinition?.displayProperties?.description || '',
      icon: itemDefinition?.displayProperties?.icon,
      screenshot: itemDefinition?.displayProperties?.screenshot,
      itemType: this.itemTypeMap[itemDefinition?.itemType] || 'Unknown',
      itemSubType: itemDefinition?.itemSubType,
      tierType: this.rarityMap[itemDefinition?.inventory?.tierType] || 'Unknown',
      tierTypeName: itemDefinition?.inventory?.tierTypeName,
      damageType: this.damageTypeMap[itemDefinition?.defaultDamageType] || 'None',
      powerLevel: itemData?.primaryStat?.value || 0,
      masterworkLevel: itemData?.energy?.energyUsed || 0,
      isEquipped: itemData?.state?.includes(4) || false, // Item state 4 = equipped
      isLocked: itemData?.state?.includes(8) || false, // Item state 8 = locked
      instanceId: itemData?.itemInstanceId,
      bucketHash: itemDefinition?.inventory?.bucketTypeHash,
      stackUniqueLabel: itemDefinition?.inventory?.stackUniqueLabel,
      maxStackSize: itemDefinition?.inventory?.maxStackSize || 1
    };

    return basic;
  }

  /**
   * Analyze item sockets (mods, perks, etc.)
   */
  async analyzeSockets(itemData, itemDefinition) {
    if (!itemData?.sockets?.data?.sockets || !itemDefinition?.sockets) {
      return { sockets: [], categories: [] };
    }

    const sockets = [];
    const categories = [];

    // Process socket categories
    if (itemDefinition.sockets.socketCategories) {
      for (const category of itemDefinition.sockets.socketCategories) {
        const categoryDefinition = await manifestProcessor.getDefinition('DestinySocketCategoryDefinition', category.socketCategoryHash);
        
        categories.push({
          hash: category.socketCategoryHash,
          name: categoryDefinition?.displayProperties?.name || 'Unknown Category',
          description: categoryDefinition?.displayProperties?.description || '',
          socketIndexes: category.socketIndexes
        });
      }
    }

    // Process individual sockets
    for (let i = 0; i < itemData.sockets.data.sockets.length; i++) {
      const socketData = itemData.sockets.data.sockets[i];
      const socketDefinition = itemDefinition.sockets.socketEntries?.[i];

      if (!socketDefinition) continue;

      const socket = {
        index: i,
        plugHash: socketData.plugHash,
        isEnabled: socketData.isEnabled,
        isVisible: socketData.isVisible,
        cannotCurrentlyRoll: socketData.cannotCurrentlyRoll
      };

      // Resolve plug definition
      if (socketData.plugHash) {
        const plugDefinition = await manifestProcessor.getDefinition('DestinyInventoryItemDefinition', socketData.plugHash);
        
        if (plugDefinition) {
          socket.plug = {
            name: plugDefinition.displayProperties?.name || 'Unknown Plug',
            description: plugDefinition.displayProperties?.description || '',
            icon: plugDefinition.displayProperties?.icon,
            plugCategoryHash: plugDefinition.plug?.plugCategoryHash,
            energyCost: plugDefinition.plug?.energyCost?.energyCost || 0,
            energyType: this.damageTypeMap[plugDefinition.plug?.energyCost?.energyType] || 'Any'
          };

          // Resolve plug category
          if (plugDefinition.plug?.plugCategoryHash) {
            const plugCategory = await manifestProcessor.getDefinition('DestinyPlugSetDefinition', plugDefinition.plug.plugCategoryHash);
            if (plugCategory) {
              socket.plug.categoryName = plugCategory.displayProperties?.name || 'Unknown Category';
            }
          }
        }
      }

      // Get socket type info
      if (socketDefinition.socketTypeHash) {
        const socketType = await manifestProcessor.getDefinition('DestinySocketTypeDefinition', socketDefinition.socketTypeHash);
        if (socketType) {
          socket.socketType = {
            name: socketType.displayProperties?.name || 'Unknown Socket Type',
            description: socketType.displayProperties?.description || ''
          };
        }
      }

      sockets.push(socket);
    }

    return { sockets, categories };
  }

  /**
   * Analyze item stats
   */
  async analyzeStats(itemData, itemDefinition) {
    const stats = {};
    
    // Instance stats (current values)
    if (itemData?.stats?.data?.stats) {
      for (const [statHash, statValue] of Object.entries(itemData.stats.data.stats)) {
        const statDefinition = await manifestProcessor.getDefinition('DestinyStatDefinition', statHash);
        
        if (statDefinition) {
          stats[statHash] = {
            name: statDefinition.displayProperties?.name || 'Unknown Stat',
            description: statDefinition.displayProperties?.description || '',
            icon: statDefinition.displayProperties?.icon,
            value: statValue.value || 0,
            aggregationType: statDefinition.aggregationType,
            hasComputedBlock: statDefinition.hasComputedBlock,
            category: statDefinition.statCategory
          };
        }
      }
    }

    // Base stats from definition
    if (itemDefinition?.stats?.stats) {
      for (const [statHash, statData] of Object.entries(itemDefinition.stats.stats)) {
        const statDefinition = await manifestProcessor.getDefinition('DestinyStatDefinition', statHash);
        
        if (statDefinition && !stats[statHash]) {
          stats[statHash] = {
            name: statDefinition.displayProperties?.name || 'Unknown Stat',
            description: statDefinition.displayProperties?.description || '',
            icon: statDefinition.displayProperties?.icon,
            value: statData.value || 0,
            minimum: statData.minimum || 0,
            maximum: statData.maximum || 100,
            aggregationType: statDefinition.aggregationType,
            hasComputedBlock: statDefinition.hasComputedBlock,
            category: statDefinition.statCategory,
            isBase: true
          };
        }
      }
    }

    return stats;
  }

  /**
   * Analyze item perks (traits, intrinsics, etc.)
   */
  async analyzePerks(itemData, itemDefinition) {
    const perks = [];

    // Intrinsic perks from sockets
    if (itemData?.sockets?.data?.sockets) {
      for (const socket of itemData.sockets.data.sockets) {
        if (socket.plugHash) {
          const plugDefinition = await manifestProcessor.getDefinition('DestinyInventoryItemDefinition', socket.plugHash);
          
          if (plugDefinition && plugDefinition.itemType === 7) { // Perk item type
            perks.push({
              hash: socket.plugHash,
              name: plugDefinition.displayProperties?.name || 'Unknown Perk',
              description: plugDefinition.displayProperties?.description || '',
              icon: plugDefinition.displayProperties?.icon,
              isIntrinsic: plugDefinition.inventory?.tierType === 2, // Common tier = intrinsic
              isPerk: true,
              socketIndex: socket.socketIndex
            });
          }
        }
      }
    }

    return perks;
  }

  /**
   * Analyze item categories
   */
  async analyzeCategories(itemDefinition) {
    const categories = [];

    if (itemDefinition?.itemCategoryHashes) {
      for (const categoryHash of itemDefinition.itemCategoryHashes) {
        const categoryDefinition = await manifestProcessor.getDefinition('DestinyItemCategoryDefinition', categoryHash);
        
        if (categoryDefinition) {
          categories.push({
            hash: categoryHash,
            name: categoryDefinition.displayProperties?.name || 'Unknown Category',
            description: categoryDefinition.displayProperties?.description || '',
            shortTitle: categoryDefinition.shortTitle,
            itemTypeRegex: categoryDefinition.itemTypeRegex,
            visible: categoryDefinition.visible
          });
        }
      }
    }

    return categories;
  }

  /**
   * Analyze item requirements
   */
  analyzeRequirements(itemDefinition) {
    return {
      powerLevel: itemDefinition?.equippingBlock?.minimumLevel || 0,
      classRestriction: itemDefinition?.classType || 3, // 3 = any class
      exclusiveToClass: itemDefinition?.classType !== 3,
      requiresLevel: itemDefinition?.equippingBlock?.minimumLevel > 0,
      ammoType: itemDefinition?.equippingBlock?.ammoType || 0,
      uniqueLabel: itemDefinition?.equippingBlock?.uniqueLabel
    };
  }

  /**
   * Analyze item quality and ratings
   */
  async analyzeQuality(itemData, itemDefinition) {
    const quality = {
      masterworked: false,
      masterworkType: null,
      energyCapacity: 0,
      energyUsed: 0,
      quality: itemDefinition?.quality || {},
      investmentStats: []
    };

    // Energy/masterwork info
    if (itemData?.energy) {
      quality.energyCapacity = itemData.energy.energyCapacity || 0;
      quality.energyUsed = itemData.energy.energyUsed || 0;
      quality.energyType = this.damageTypeMap[itemData.energy.energyType] || 'Any';
      quality.masterworked = quality.energyCapacity >= 10;
    }

    // Investment stats (upgrades, XP, etc.)
    if (itemDefinition?.investmentStats) {
      for (const investment of itemDefinition.investmentStats) {
        const statDefinition = await manifestProcessor.getDefinition('DestinyStatDefinition', investment.statTypeHash);
        
        if (statDefinition) {
          quality.investmentStats.push({
            statHash: investment.statTypeHash,
            name: statDefinition.displayProperties?.name || 'Unknown Stat',
            value: investment.value,
            isConditionallyActive: investment.isConditionallyActive
          });
        }
      }
    }

    return quality;
  }

  /**
   * Analyze item metadata
   */
  analyzeMetadata(itemDefinition) {
    return {
      collectibleHash: itemDefinition?.collectibleHash,
      loreHash: itemDefinition?.loreHash,
      summaryItemHash: itemDefinition?.summaryItemHash,
      allowActions: itemDefinition?.allowActions || false,
      doesPostmasterPullHaveSideEffects: itemDefinition?.doesPostmasterPullHaveSideEffects || false,
      nonTransferrable: itemDefinition?.nonTransferrable || false,
      specialItemType: itemDefinition?.specialItemType,
      itemValue: itemDefinition?.itemValue || [],
      sourceData: itemDefinition?.sourceData || {},
      acquireRewardSiteHash: itemDefinition?.acquireRewardSiteHash,
      acquireUnlockHash: itemDefinition?.acquireUnlockHash
    };
  }

  /**
   * Get weapon archetype information
   */
  async getWeaponArchetype(itemDefinition) {
    if (itemDefinition?.itemType !== 1) return null; // Not a weapon

    const archetypes = [];
    
    // Check intrinsic perks for archetype
    if (itemDefinition?.sockets?.socketEntries) {
      for (const socket of itemDefinition.sockets.socketEntries) {
        for (const plugHash of socket.reusablePlugItems || []) {
          const plugDefinition = await manifestProcessor.getDefinition('DestinyInventoryItemDefinition', plugHash.plugItemHash);
          
          if (plugDefinition && plugDefinition.inventory?.tierType === 2) { // Intrinsic perk
            archetypes.push({
              hash: plugHash.plugItemHash,
              name: plugDefinition.displayProperties?.name || 'Unknown Archetype',
              description: plugDefinition.displayProperties?.description || ''
            });
          }
        }
      }
    }

    return archetypes;
  }

  /**
   * Batch analyze multiple items
   */
  async batchAnalyzeItems(itemsData, includeFullAnalysis = false) {
    const analyses = {};
    
    for (const itemData of itemsData) {
      try {
        if (includeFullAnalysis) {
          analyses[itemData.itemHash] = await this.analyzeItem(itemData);
        } else {
          // Basic analysis only
          const itemDefinition = await manifestProcessor.getDefinition('DestinyInventoryItemDefinition', itemData.itemHash);
          analyses[itemData.itemHash] = {
            basic: this.analyzeBasicProperties(itemData, itemDefinition || {}),
            hash: itemData.itemHash
          };
        }
      } catch (error) {
        console.warn(`Failed to analyze item ${itemData.itemHash}:`, error.message);
        analyses[itemData.itemHash] = {
          error: error.message,
          hash: itemData.itemHash
        };
      }
    }

    return analyses;
  }
}

// Create and export singleton
export const destinyItemAnalyzer = new DestinyItemAnalyzer();
export default destinyItemAnalyzer;