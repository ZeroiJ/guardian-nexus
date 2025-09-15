/**
 * Hash Resolution Example
 * Demonstrates how to use the manifest processor and item analyzer
 * to resolve Destiny 2 hashes to meaningful text and data
 */

import manifestProcessor from '../services/manifestProcessor';
import destinyItemAnalyzer from '../utils/destinyItemAnalyzer';
import BungieAPIService from '../services/bungieAPI';

/**
 * Example: Analyze a character's equipment
 */
export async function analyzeCharacterEquipment() {
  try {
    // Initialize the manifest processor (downloads and processes manifest)
    await manifestProcessor.initialize();
    
    // Get the user's characters
    const charactersData = await BungieAPIService.getAllCharacters();
    const character = Object.values(charactersData.Response.characters.data)[0];
    const characterEquipment = charactersData.Response.characterEquipments.data[character.characterId];
    
    console.log('Analyzing character equipment...');
    
    // Analyze each equipped item
    for (const item of characterEquipment.items) {
      console.log('\n--- Analyzing Item ---');
      
      // Get basic item info first
      const itemDefinition = await manifestProcessor.getDefinition('DestinyInventoryItemDefinition', item.itemHash);
      
      console.log(`Item: ${itemDefinition.displayProperties.name}`);
      console.log(`Type: ${itemDefinition.itemType === 1 ? 'Weapon' : itemDefinition.itemType === 2 ? 'Armor' : 'Other'}`);
      console.log(`Description: ${itemDefinition.displayProperties.description}`);
      
      // Full analysis with hash resolution
      const analysis = await destinyItemAnalyzer.analyzeItem(item, itemDefinition);
      
      console.log('Basic Properties:', {
        name: analysis.basic.name,
        type: analysis.basic.itemType,
        rarity: analysis.basic.tierType,
        damageType: analysis.basic.damageType,
        powerLevel: analysis.basic.powerLevel,
        isEquipped: analysis.basic.isEquipped
      });
      
      // Show resolved stats
      if (Object.keys(analysis.stats).length > 0) {
        console.log('Stats:');
        for (const [statHash, stat] of Object.entries(analysis.stats)) {
          console.log(`  ${stat.name}: ${stat.value}`);
        }
      }
      
      // Show resolved sockets/perks
      if (analysis.sockets.sockets.length > 0) {
        console.log('Sockets/Perks:');
        for (const socket of analysis.sockets.sockets) {
          if (socket.plug) {
            console.log(`  ${socket.plug.name}: ${socket.plug.description}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Equipment analysis failed:', error);
  }
}

/**
 * Example: Search for weapons by name and analyze them
 */
export async function searchAndAnalyzeWeapons(searchTerm = 'Fatebringer') {
  try {
    await manifestProcessor.initialize();
    
    console.log(`Searching for weapons containing "${searchTerm}"...`);
    
    // Search for weapons
    const searchResults = await manifestProcessor.searchDefinitions('DestinyInventoryItemDefinition', searchTerm, 5);
    
    for (const result of searchResults) {
      // Only analyze weapons
      if (result.itemType === 1) {
        console.log(`\n--- Weapon: ${result.displayProperties.name} ---`);
        
        // Create mock item data (since we don't have instance data)
        const mockItemData = {
          itemHash: result.hash,
          itemInstanceId: null,
          primaryStat: { value: 1600 }, // Example power level
          state: []
        };
        
        const analysis = await destinyItemAnalyzer.analyzeItem(mockItemData, result);
        
        console.log('Details:', {
          name: analysis.basic.name,
          description: analysis.basic.description,
          type: analysis.basic.itemType,
          subType: analysis.basic.itemSubType,
          rarity: analysis.basic.tierType,
          damageType: analysis.basic.damageType
        });
        
        // Show weapon archetype
        const archetype = await destinyItemAnalyzer.getWeaponArchetype(result);
        if (archetype && archetype.length > 0) {
          console.log('Archetype:', archetype[0].name);
        }
        
        // Show categories
        if (analysis.categories.length > 0) {
          console.log('Categories:', analysis.categories.map(cat => cat.name).join(', '));
        }
      }
    }
  } catch (error) {
    console.error('Weapon search and analysis failed:', error);
  }
}

/**
 * Example: Resolve specific hashes to text
 */
export async function resolveSpecificHashes() {
  try {
    await manifestProcessor.initialize();
    
    console.log('Resolving specific hashes...');
    
    // Example hashes (you can replace with actual hashes from API responses)
    const testHashes = [
      { type: 'DestinyInventoryItemDefinition', hash: 1363886209 }, // Example weapon hash
      { type: 'DestinyStatDefinition', hash: 1480404414 }, // Attack stat
      { type: 'DestinyDamageTypeDefinition', hash: 3373582085 }, // Kinetic damage
      { type: 'DestinyItemCategoryDefinition', hash: 5 } // Weapon category
    ];
    
    for (const hashInfo of testHashes) {
      console.log(`\n--- Resolving ${hashInfo.type}:${hashInfo.hash} ---`);
      
      const definition = await manifestProcessor.getDefinition(hashInfo.type, hashInfo.hash);
      
      if (definition) {
        console.log('Resolved to:', {
          name: definition.displayProperties?.name || 'No name',
          description: definition.displayProperties?.description || 'No description',
          icon: definition.displayProperties?.icon || 'No icon'
        });
      } else {
        console.log('Could not resolve hash');
      }
    }
  } catch (error) {
    console.error('Hash resolution failed:', error);
  }
}

/**
 * Example: Batch process multiple item hashes
 */
export async function batchProcessItems(itemHashes) {
  try {
    await manifestProcessor.initialize();
    
    console.log('Batch processing items...');
    
    // Get multiple definitions at once
    const definitions = await manifestProcessor.batchGetDefinitions('DestinyInventoryItemDefinition', itemHashes);
    
    console.log(`Processed ${Object.keys(definitions).length} items:`);
    
    for (const [hash, definition] of Object.entries(definitions)) {
      console.log(`- ${hash}: ${definition.displayProperties?.name || 'Unknown'}`);
    }
    
    return definitions;
  } catch (error) {
    console.error('Batch processing failed:', error);
    return {};
  }
}

/**
 * Example: Get cache statistics
 */
export function getCacheInfo() {
  const stats = manifestProcessor.getCacheStats();
  
  console.log('Manifest Cache Statistics:', {
    version: stats.manifestVersion,
    definitionCount: stats.definitionCount,
    isInitialized: stats.isInitialized,
    estimatedMemoryUsage: `${Math.round(stats.memoryUsage / 1024)} MB`
  });
  
  return stats;
}

// Export all example functions
export default {
  analyzeCharacterEquipment,
  searchAndAnalyzeWeapons,
  resolveSpecificHashes,
  batchProcessItems,
  getCacheInfo
};