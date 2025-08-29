import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const InventoryPanel = ({ onItemSelect, selectedSlot }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('power');

  // Mock inventory data
  const mockInventory = [
    {
      id: 'fatebringer',
      name: 'Fatebringer (Timelost)',
      type: 'Hand Cannon',
      slot: 'kinetic',
      powerLevel: 1810,
      icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
      rarity: 'exotic',
      stats: { impact: 84, range: 46, stability: 34, handling: 38, reload: 33, rpm: 140 },
      perks: ['Explosive Payload', 'Firefly'],
      optimizedFor: ['pve', 'raid']
    },
    {
      id: 'palindrome',
      name: 'The Palindrome',
      type: 'Hand Cannon',
      slot: 'energy',
      powerLevel: 1808,
      icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
      rarity: 'legendary',
      stats: { impact: 84, range: 62, stability: 51, handling: 32, reload: 28, rpm: 140 },
      perks: ['Rangefinder', 'Kill Clip'],
      optimizedFor: ['pvp', 'pve']
    },
    {
      id: 'gjallarhorn',
      name: 'Gjallarhorn',
      type: 'Rocket Launcher',
      slot: 'power',
      powerLevel: 1810,
      icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
      rarity: 'exotic',
      stats: { impact: 95, range: 50, stability: 27, handling: 32, reload: 33, rpm: 15 },
      perks: ['Wolfpack Rounds', 'Tracking Module'],
      optimizedFor: ['pve', 'raid']
    },
    {
      id: 'helm-saint14',
      name: 'Helm of Saint-14',
      type: 'Helmet',
      slot: 'helmet',
      powerLevel: 1810,
      icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
      rarity: 'exotic',
      stats: { mobility: 2, resilience: 20, recovery: 10, discipline: 6, intellect: 12, strength: 2 },
      perks: ['Starless Night'],
      optimizedFor: ['pve', 'raid']
    },
    {
      id: 'dunemarchers',
      name: 'Dunemarchers',
      type: 'Leg Armor',
      slot: 'legs',
      powerLevel: 1809,
      icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
      rarity: 'exotic',
      stats: { mobility: 12, resilience: 6, recovery: 6, discipline: 2, intellect: 2, strength: 20 },
      perks: ['Linear Actuators'],
      optimizedFor: ['pvp', 'pve']
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Items' },
    { value: 'weapon', label: 'Weapons' },
    { value: 'armor', label: 'Armor' },
    { value: 'exotic', label: 'Exotic' },
    { value: 'legendary', label: 'Legendary' }
  ];

  const sortOptions = [
    { value: 'power', label: 'Power Level' },
    { value: 'name', label: 'Name' },
    { value: 'type', label: 'Type' },
    { value: 'rarity', label: 'Rarity' }
  ];

  const filteredItems = mockInventory?.filter(item => {
      const matchesSearch = item?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                           item?.type?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      
      const matchesFilter = filterType === 'all' || 
                           item?.type?.toLowerCase()?.includes(filterType) ||
                           item?.rarity === filterType ||
                           (filterType === 'weapon' && ['kinetic', 'energy', 'power']?.includes(item?.slot)) ||
                           (filterType === 'armor' && ['helmet', 'gauntlets', 'chest', 'legs', 'classItem']?.includes(item?.slot));
      
      const matchesSlot = !selectedSlot || item?.slot === selectedSlot;
      
      return matchesSearch && matchesFilter && matchesSlot;
    })?.sort((a, b) => {
      switch (sortBy) {
        case 'power':
          return b?.powerLevel - a?.powerLevel;
        case 'name':
          return a?.name?.localeCompare(b?.name);
        case 'type':
          return a?.type?.localeCompare(b?.type);
        case 'rarity':
          return a?.rarity?.localeCompare(b?.rarity);
        default:
          return 0;
      }
    });

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'exotic': return 'border-accent bg-accent/10';
      case 'legendary': return 'border-secondary bg-secondary/10';
      case 'rare': return 'border-primary bg-primary/10';
      default: return 'border-border bg-card';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-semibold text-foreground flex items-center">
          <Icon name="Package" size={20} className="mr-2 text-primary" />
          Inventory
          {selectedSlot && (
            <span className="ml-2 text-sm text-muted-foreground">
              • {selectedSlot}
            </span>
          )}
        </h3>
        <div className="text-sm text-muted-foreground">
          {filteredItems?.length} items
        </div>
      </div>
      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <Input
          type="search"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e?.target?.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Filter"
            options={filterOptions}
            value={filterType}
            onChange={setFilterType}
          />

          <Select
            label="Sort by"
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
          />
        </div>
      </div>
      {/* Items Grid */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredItems?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No items found</p>
          </div>
        ) : (
          filteredItems?.map((item) => (
            <div
              key={item?.id}
              onClick={() => onItemSelect(item)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-tactical hover:shadow-tactical ${getRarityColor(item?.rarity)}`}
            >
              <div className="flex items-center space-x-4">
                {/* Item Icon */}
                <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item?.icon}
                    alt={item?.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Item Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground truncate">{item?.name}</h4>
                    <div className="flex items-center space-x-2 ml-2">
                      <span className="text-xs text-success font-mono">{item?.powerLevel}</span>
                      {item?.optimizedFor && item?.optimizedFor?.length > 0 && (
                        <div className="flex space-x-1">
                          {item?.optimizedFor?.slice(0, 2)?.map((activity) => (
                            <span
                              key={activity}
                              className="px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded uppercase"
                            >
                              {activity}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">{item?.type}</p>
                  
                  {/* Perks */}
                  {item?.perks && item?.perks?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item?.perks?.slice(0, 2)?.map((perk) => (
                        <span
                          key={perk}
                          className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded"
                        >
                          {perk}
                        </span>
                      ))}
                      {item?.perks?.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded">
                          +{item?.perks?.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats Preview */}
                  {item?.stats && (
                    <div className="flex items-center space-x-3 mt-2 text-xs">
                      {Object.entries(item?.stats)?.slice(0, 3)?.map(([stat, value]) => (
                        <div key={stat} className="flex items-center space-x-1">
                          <span className="text-muted-foreground capitalize">{stat?.slice(0, 3)}</span>
                          <span className="text-foreground font-mono">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Select Button */}
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Plus"
                  onClick={(e) => {
                    e?.stopPropagation();
                    onItemSelect(item);
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InventoryPanel;