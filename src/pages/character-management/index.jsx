import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import CharacterSelector from './components/CharacterSelector';
import CharacterModel from './components/CharacterModel';
import EquipmentSlots from './components/EquipmentSlots';
import InventoryManager from './components/InventoryManager';
import LoadoutManager from './components/LoadoutManager';

const CharacterManagement = () => {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);

  // Mock data for characters
  const mockCharacters = [
    {
      id: 1,
      name: "Guardian Alpha",
      class: "Titan",
      powerLevel: 1810,
      playtime: "247h 32m",
      lastActivity: "2 hours ago",
      emblem: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=100&h=100&fit=crop&crop=face",
      avatar: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=200&h=200&fit=crop&crop=face",
      stats: {
        mobility: 68,
        resilience: 100,
        recovery: 42,
        discipline: 78,
        intellect: 55,
        strength: 89
      },
      subclass: {
        name: "Sentinel",
        element: "Void"
      }
    },
    {
      id: 2,
      name: "Guardian Beta",
      class: "Hunter",
      powerLevel: 1805,
      playtime: "189h 45m",
      lastActivity: "1 day ago",
      emblem: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      stats: {
        mobility: 100,
        resilience: 45,
        recovery: 78,
        discipline: 62,
        intellect: 89,
        strength: 34
      },
      subclass: {
        name: "Nightstalker",
        element: "Void"
      }
    },
    {
      id: 3,
      name: "Guardian Gamma",
      class: "Warlock",
      powerLevel: 1798,
      playtime: "156h 18m",
      lastActivity: "3 days ago",
      emblem: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
      stats: {
        mobility: 34,
        resilience: 56,
        recovery: 100,
        discipline: 89,
        intellect: 100,
        strength: 23
      },
      subclass: {
        name: "Voidwalker",
        element: "Void"
      }
    }
  ];

  // Mock equipment data
  const mockEquipment = {
    kinetic: {
      id: "k1",
      name: "Fatebringer",
      type: "Hand Cannon",
      rarity: "Legendary",
      powerLevel: 1810,
      icon: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=100&h=100&fit=crop",
      masterwork: true,
      category: "weapons"
    },
    energy: {
      id: "e1",
      name: "Ikelos SMG",
      type: "Submachine Gun",
      rarity: "Legendary",
      powerLevel: 1808,
      icon: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=100&h=100&fit=crop",
      masterwork: false,
      category: "weapons"
    },
    power: {
      id: "p1",
      name: "Gjallarhorn",
      type: "Rocket Launcher",
      rarity: "Exotic",
      powerLevel: 1810,
      icon: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=100&h=100&fit=crop",
      masterwork: true,
      category: "weapons"
    },
    helmet: {
      id: "h1",
      name: "Helm of Saint-14",
      type: "Titan Helmet",
      rarity: "Exotic",
      powerLevel: 1807,
      icon: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop",
      masterwork: true,
      category: "armor"
    },
    arms: {
      id: "a1",
      name: "Synthoceps",
      type: "Titan Gauntlets",
      rarity: "Exotic",
      powerLevel: 1805,
      icon: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop",
      masterwork: false,
      category: "armor"
    },
    chest: {
      id: "c1",
      name: "Actium War Rig",
      type: "Titan Chest",
      rarity: "Exotic",
      powerLevel: 1809,
      icon: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop",
      masterwork: true,
      category: "armor"
    },
    legs: {
      id: "l1",
      name: "Lion Rampant",
      type: "Titan Legs",
      rarity: "Exotic",
      powerLevel: 1806,
      icon: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop",
      masterwork: false,
      category: "armor"
    },
    classItem: {
      id: "ci1",
      name: "Mark of the Great Hunt",
      type: "Titan Mark",
      rarity: "Legendary",
      powerLevel: 1810,
      icon: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop",
      masterwork: true,
      category: "armor"
    }
  };

  // Mock inventory data
  const mockInventory = [
    {
      id: "inv1",
      name: "Palindrome",
      type: "Hand Cannon",
      rarity: "Legendary",
      powerLevel: 1805,
      icon: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=100&h=100&fit=crop",
      category: "weapons",
      masterwork: false,
      locked: true,
      quantity: 1
    },
    {
      id: "inv2",
      name: "The Messenger",
      type: "Pulse Rifle",
      rarity: "Legendary",
      powerLevel: 1803,
      icon: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=100&h=100&fit=crop",
      category: "weapons",
      masterwork: true,
      locked: false,
      quantity: 1
    },
    {
      id: "inv3",
      name: "Falling Guillotine",
      type: "Sword",
      rarity: "Legendary",
      powerLevel: 1807,
      icon: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=100&h=100&fit=crop",
      category: "weapons",
      masterwork: true,
      locked: false,
      quantity: 1
    },
    {
      id: "inv4",
      name: "Dunemarchers",
      type: "Titan Legs",
      rarity: "Exotic",
      powerLevel: 1804,
      icon: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop",
      category: "armor",
      masterwork: false,
      locked: true,
      quantity: 1
    },
    {
      id: "inv5",
      name: "Enhancement Cores",
      type: "Material",
      rarity: "Legendary",
      icon: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=100&h=100&fit=crop",
      category: "materials",
      quantity: 247
    },
    {
      id: "inv6",
      name: "Ascendant Shards",
      type: "Material",
      rarity: "Exotic",
      icon: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=100&h=100&fit=crop",
      category: "materials",
      quantity: 12
    }
  ];

  // Mock loadouts data
  const mockLoadouts = [
    {
      id: "l1",
      name: "Raid DPS Build",
      description: "Optimized for maximum damage output in raid encounters",
      activityType: "raid",
      lastUsed: "2 days ago",
      stats: {
        mobility: 68,
        resilience: 100,
        recovery: 42
      },
      equipment: [
        mockEquipment?.kinetic,
        mockEquipment?.energy,
        mockEquipment?.power,
        mockEquipment?.helmet,
        mockEquipment?.arms,
        mockEquipment?.chest,
        mockEquipment?.legs,
        mockEquipment?.classItem
      ]
    },
    {
      id: "l2",
      name: "PvP Crucible",
      description: "High mobility setup for Crucible dominance",
      activityType: "pvp",
      lastUsed: "5 hours ago",
      stats: {
        mobility: 100,
        resilience: 45,
        recovery: 78
      },
      equipment: [
        mockEquipment?.kinetic,
        mockEquipment?.energy,
        mockInventory?.[0],
        mockEquipment?.helmet,
        mockInventory?.[3],
        mockEquipment?.chest,
        mockEquipment?.legs,
        mockEquipment?.classItem
      ]
    },
    {
      id: "l3",
      name: "General PvE",
      description: "Balanced build for general PvE activities",
      activityType: "pve",
      lastUsed: "1 week ago",
      stats: {
        mobility: 78,
        resilience: 67,
        recovery: 89
      },
      equipment: [
        mockInventory?.[1],
        mockEquipment?.energy,
        mockInventory?.[2],
        mockEquipment?.helmet,
        mockEquipment?.arms,
        mockEquipment?.chest,
        mockInventory?.[3],
        mockEquipment?.classItem
      ]
    }
  ];

  useEffect(() => {
    if (mockCharacters?.length > 0) {
      setSelectedCharacter(mockCharacters?.[0]);
    }
  }, []);

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
  };

  const handleEquipmentSelect = (slotId, equipment) => {
    setSelectedEquipment({ slotId, equipment });
  };

  const handleInventoryItemSelect = (item) => {
    setSelectedInventoryItem(item);
  };

  const handleTransferItem = (item, destination) => {
    console.log(`Transferring ${item?.name} to ${destination}`);
    // Handle item transfer logic
  };

  const handleEquipItem = (item) => {
    console.log(`Equipping ${item?.name}`);
    // Handle equip item logic
  };

  const handleLoadoutSelect = (loadout) => {
    console.log(`Selected loadout: ${loadout?.name}`);
  };

  const handleLoadoutSave = (loadoutData) => {
    console.log(`Saving loadout:`, loadoutData);
    // Handle save loadout logic
  };

  const handleLoadoutDelete = (loadoutId) => {
    console.log(`Deleting loadout: ${loadoutId}`);
    // Handle delete loadout logic
  };

  const handleLoadoutApply = (loadout) => {
    console.log(`Applying loadout: ${loadout?.name}`);
    // Handle apply loadout logic
  };

  if (!selectedCharacter) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-lg font-medium text-muted-foreground">Loading characters...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Character Management - Guardian Nexus</title>
        <meta name="description" content="Manage your Destiny 2 characters, equipment, inventory, and loadouts with Guardian Nexus." />
      </Helmet>

      <Header />
      
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Character Selector */}
          <CharacterSelector
            characters={mockCharacters}
            selectedCharacter={selectedCharacter}
            onCharacterSelect={handleCharacterSelect}
          />

          {/* Character Model */}
          <CharacterModel character={selectedCharacter} />

          {/* Equipment Slots */}
          <EquipmentSlots
            equipment={mockEquipment}
            onEquipmentSelect={handleEquipmentSelect}
            onTransferItem={handleTransferItem}
          />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Inventory Manager */}
            <InventoryManager
              inventory={mockInventory}
              onItemSelect={handleInventoryItemSelect}
              onTransferItem={handleTransferItem}
              onEquipItem={handleEquipItem}
            />

            {/* Loadout Manager */}
            <LoadoutManager
              loadouts={mockLoadouts}
              onLoadoutSelect={handleLoadoutSelect}
              onLoadoutSave={handleLoadoutSave}
              onLoadoutDelete={handleLoadoutDelete}
              onLoadoutApply={handleLoadoutApply}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CharacterManagement;