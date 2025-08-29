import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const EquipmentSlots = ({ equipment, onEquipmentSelect, onTransferItem }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);

  const equipmentSlots = [
    { id: 'kinetic', name: 'Kinetic Weapon', icon: 'Sword', category: 'weapons' },
    { id: 'energy', name: 'Energy Weapon', icon: 'Zap', category: 'weapons' },
    { id: 'power', name: 'Power Weapon', icon: 'Bomb', category: 'weapons' },
    { id: 'helmet', name: 'Helmet', icon: 'HardHat', category: 'armor' },
    { id: 'arms', name: 'Arms', icon: 'Hand', category: 'armor' },
    { id: 'chest', name: 'Chest', icon: 'Shield', category: 'armor' },
    { id: 'legs', name: 'Legs', icon: 'Footprints', category: 'armor' },
    { id: 'classItem', name: 'Class Item', icon: 'Crown', category: 'armor' }
  ];

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Exotic': return 'text-warning';
      case 'Legendary': return 'text-accent';
      case 'Rare': return 'text-primary';
      case 'Uncommon': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const handleSlotClick = (slotId) => {
    setSelectedSlot(selectedSlot === slotId ? null : slotId);
    if (onEquipmentSelect) {
      onEquipmentSelect(slotId, equipment?.[slotId]);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-heading font-bold text-foreground">Equipment</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" iconName="RefreshCw" iconPosition="left">
            Refresh
          </Button>
          <Button variant="ghost" size="sm" iconName="Settings" iconPosition="left">
            Optimize
          </Button>
        </div>
      </div>
      {/* Weapons Section */}
      <div className="mb-8">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Icon name="Sword" size={20} />
          <span>Weapons</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {equipmentSlots?.filter(slot => slot?.category === 'weapons')?.map((slot) => {
            const item = equipment?.[slot?.id];
            const isSelected = selectedSlot === slot?.id;
            
            return (
              <div
                key={slot?.id}
                onClick={() => handleSlotClick(slot?.id)}
                className={`relative p-4 rounded-lg border cursor-pointer transition-tactical hover-scale ${
                  isSelected 
                    ? 'border-primary bg-primary/10 shadow-tactical' 
                    : 'border-border bg-muted hover:border-primary/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 rounded-lg bg-background border border-border flex items-center justify-center overflow-hidden">
                    {item ? (
                      <Image
                        src={item?.icon}
                        alt={item?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon name={slot?.icon} size={24} color="var(--color-muted-foreground)" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-muted-foreground mb-1">{slot?.name}</div>
                    {item ? (
                      <>
                        <div className={`text-sm font-semibold truncate ${getRarityColor(item?.rarity)}`}>
                          {item?.name}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs font-mono text-primary">{item?.powerLevel}</span>
                          {item?.masterwork && (
                            <Icon name="Star" size={12} color="var(--color-warning)" />
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">Empty Slot</div>
                    )}
                  </div>
                </div>
                {item && (
                  <div className="absolute top-2 right-2">
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
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Armor Section */}
      <div>
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Icon name="Shield" size={20} />
          <span>Armor</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {equipmentSlots?.filter(slot => slot?.category === 'armor')?.map((slot) => {
            const item = equipment?.[slot?.id];
            const isSelected = selectedSlot === slot?.id;
            
            return (
              <div
                key={slot?.id}
                onClick={() => handleSlotClick(slot?.id)}
                className={`relative p-4 rounded-lg border cursor-pointer transition-tactical hover-scale ${
                  isSelected 
                    ? 'border-primary bg-primary/10 shadow-tactical' 
                    : 'border-border bg-muted hover:border-primary/50'
                }`}
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-lg bg-background border border-border flex items-center justify-center overflow-hidden mb-3">
                    {item ? (
                      <Image
                        src={item?.icon}
                        alt={item?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon name={slot?.icon} size={24} color="var(--color-muted-foreground)" />
                    )}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">{slot?.name}</div>
                  {item ? (
                    <>
                      <div className={`text-xs font-semibold truncate ${getRarityColor(item?.rarity)}`}>
                        {item?.name}
                      </div>
                      <div className="flex items-center justify-center space-x-1 mt-1">
                        <span className="text-xs font-mono text-primary">{item?.powerLevel}</span>
                        {item?.masterwork && (
                          <Icon name="Star" size={10} color="var(--color-warning)" />
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-muted-foreground">Empty</div>
                  )}
                </div>
                {item && (
                  <div className="absolute top-1 right-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e?.stopPropagation();
                        onTransferItem && onTransferItem(item, 'vault');
                      }}
                      className="w-5 h-5"
                    >
                      <Icon name="ArrowUpDown" size={10} />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EquipmentSlots;