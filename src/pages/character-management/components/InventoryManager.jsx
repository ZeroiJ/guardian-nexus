import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const InventoryManager = ({ inventory, onItemSelect, onTransferItem, onEquipItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [sortBy, setSortBy] = useState('powerLevel');

  const categoryOptions = [
    { value: 'all', label: 'All Items' },
    { value: 'weapons', label: 'Weapons' },
    { value: 'armor', label: 'Armor' },
    { value: 'consumables', label: 'Consumables' },
    { value: 'materials', label: 'Materials' }
  ];

  const rarityOptions = [
    { value: 'all', label: 'All Rarities' },
    { value: 'Exotic', label: 'Exotic' },
    { value: 'Legendary', label: 'Legendary' },
    { value: 'Rare', label: 'Rare' },
    { value: 'Uncommon', label: 'Uncommon' },
    { value: 'Common', label: 'Common' }
  ];

  const sortOptions = [
    { value: 'powerLevel', label: 'Power Level' },
    { value: 'name', label: 'Name' },
    { value: 'rarity', label: 'Rarity' },
    { value: 'type', label: 'Type' }
  ];

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Exotic': return 'text-warning border-warning/20 bg-warning/5';
      case 'Legendary': return 'text-accent border-accent/20 bg-accent/5';
      case 'Rare': return 'text-primary border-primary/20 bg-primary/5';
      case 'Uncommon': return 'text-success border-success/20 bg-success/5';
      default: return 'text-muted-foreground border-border bg-muted';
    }
  };

  const getItemIcon = (type) => {
    switch (type) {
      case 'Auto Rifle':
      case 'Scout Rifle': case'Pulse Rifle': return 'Rifle';
      case 'Hand Cannon': return 'Target';
      case 'Shotgun': return 'Zap';
      case 'Sniper Rifle': return 'Crosshair';
      case 'Rocket Launcher': return 'Rocket';
      case 'Sword': return 'Sword';
      case 'Helmet': return 'HardHat';
      case 'Gauntlets': return 'Hand';
      case 'Chest Armor': return 'Shield';
      case 'Leg Armor': return 'Footprints';
      case 'Class Item': return 'Crown';
      default: return 'Package';
    }
  };

  const filteredInventory = inventory?.filter(item => {
      const matchesSearch = item?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                           item?.type?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item?.category === selectedCategory;
      const matchesRarity = selectedRarity === 'all' || item?.rarity === selectedRarity;
      return matchesSearch && matchesCategory && matchesRarity;
    })?.sort((a, b) => {
      switch (sortBy) {
        case 'powerLevel':
          return (b?.powerLevel || 0) - (a?.powerLevel || 0);
        case 'name':
          return a?.name?.localeCompare(b?.name);
        case 'rarity':
          const rarityOrder = { 'Exotic': 5, 'Legendary': 4, 'Rare': 3, 'Uncommon': 2, 'Common': 1 };
          return (rarityOrder?.[b?.rarity] || 0) - (rarityOrder?.[a?.rarity] || 0);
        case 'type':
          return a?.type?.localeCompare(b?.type);
        default:
          return 0;
      }
    });

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-heading font-bold text-foreground">Inventory</h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Package" size={16} />
          <span>{filteredInventory?.length} / {inventory?.length} Items</span>
        </div>
      </div>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Input
          type="search"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e?.target?.value)}
          className="w-full"
        />
        <Select
          placeholder="Category"
          options={categoryOptions}
          value={selectedCategory}
          onChange={setSelectedCategory}
        />
        <Select
          placeholder="Rarity"
          options={rarityOptions}
          value={selectedRarity}
          onChange={setSelectedRarity}
        />
        <Select
          placeholder="Sort by"
          options={sortOptions}
          value={sortBy}
          onChange={setSortBy}
        />
      </div>
      {/* Bulk Actions */}
      <div className="flex flex-wrap items-center gap-2 mb-6 p-4 bg-muted rounded-lg">
        <span className="text-sm font-medium text-foreground">Bulk Actions:</span>
        <Button variant="outline" size="sm" iconName="ArrowUp" iconPosition="left">
          Transfer to Vault
        </Button>
        <Button variant="outline" size="sm" iconName="ArrowDown" iconPosition="left">
          Pull from Vault
        </Button>
        <Button variant="outline" size="sm" iconName="Users" iconPosition="left">
          Move to Character
        </Button>
        <Button variant="outline" size="sm" iconName="Trash2" iconPosition="left">
          Dismantle Selected
        </Button>
      </div>
      {/* Inventory Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredInventory?.map((item) => (
          <div
            key={item?.id}
            onClick={() => onItemSelect && onItemSelect(item)}
            className={`relative p-3 rounded-lg border cursor-pointer transition-tactical hover-scale ${getRarityColor(item?.rarity)}`}
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-lg bg-background border border-border flex items-center justify-center overflow-hidden mb-2">
                <Image
                  src={item?.icon}
                  alt={item?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="text-xs font-semibold text-foreground truncate mb-1">
                {item?.name}
              </div>
              
              <div className="text-xs text-muted-foreground mb-1">
                {item?.type}
              </div>
              
              {item?.powerLevel && (
                <div className="text-xs font-mono text-primary mb-2">
                  {item?.powerLevel}
                </div>
              )}

              {/* Item Actions */}
              <div className="flex items-center justify-center space-x-1">
                {(item?.category === 'weapons' || item?.category === 'armor') && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e?.stopPropagation();
                      onEquipItem && onEquipItem(item);
                    }}
                    className="w-6 h-6"
                  >
                    <Icon name="Zap" size={12} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e?.stopPropagation();
                    onTransferItem && onTransferItem(item, 'vault');
                  }}
                  className="w-6 h-6"
                >
                  <Icon name="ArrowUpDown" size={12} />
                </Button>
              </div>
            </div>

            {/* Item Indicators */}
            <div className="absolute top-1 right-1 flex flex-col space-y-1">
              {item?.masterwork && (
                <div className="w-4 h-4 bg-warning rounded-full flex items-center justify-center">
                  <Icon name="Star" size={8} color="white" />
                </div>
              )}
              {item?.locked && (
                <div className="w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
                  <Icon name="Lock" size={8} color="white" />
                </div>
              )}
              {item?.quantity > 1 && (
                <div className="px-1 py-0.5 bg-primary rounded text-xs font-mono text-white">
                  {item?.quantity}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {filteredInventory?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Package" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
          <div className="text-lg font-medium text-muted-foreground mb-2">No items found</div>
          <div className="text-sm text-muted-foreground">
            Try adjusting your search or filter criteria
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;