import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const LoadoutGrid = ({ loadout, onSlotClick, selectedActivity }) => {
  const weaponSlots = [
    { id: 'kinetic', name: 'Kinetic', type: 'weapon', icon: 'Zap' },
    { id: 'energy', name: 'Energy', type: 'weapon', icon: 'Flame' },
    { id: 'power', name: 'Power', type: 'weapon', icon: 'Bomb' }
  ];

  const armorSlots = [
    { id: 'helmet', name: 'Helmet', type: 'armor', icon: 'Shield' },
    { id: 'gauntlets', name: 'Gauntlets', type: 'armor', icon: 'Hand' },
    { id: 'chest', name: 'Chest Armor', type: 'armor', icon: 'ShieldCheck' },
    { id: 'legs', name: 'Leg Armor', type: 'armor', icon: 'Move' },
    { id: 'classItem', name: 'Class Item', type: 'armor', icon: 'Crown' }
  ];

  const renderSlot = (slot) => {
    const item = loadout?.[slot?.id];
    const isEmpty = !item;

    return (
      <div
        key={slot?.id}
        onClick={() => onSlotClick(slot?.id)}
        className="relative bg-card border border-border rounded-lg p-4 cursor-pointer transition-tactical hover:border-primary hover:shadow-tactical group"
      >
        {/* Slot Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Icon name={slot?.icon} size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{slot?.name}</span>
          </div>
          {!isEmpty && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-xs text-success font-mono">{item?.powerLevel}</span>
            </div>
          )}
        </div>
        {/* Item Display */}
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-muted rounded-md group-hover:border-primary/50">
            <Icon name="Plus" size={24} className="text-muted-foreground group-hover:text-primary" />
            <span className="text-xs text-muted-foreground mt-1">Add {slot?.type}</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-muted rounded-md overflow-hidden">
                <Image
                  src={item?.icon}
                  alt={item?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground truncate">{item?.name}</h4>
                <p className="text-xs text-muted-foreground">{item?.type}</p>
              </div>
            </div>
            
            {/* Item Stats Preview */}
            {item?.stats && (
              <div className="grid grid-cols-3 gap-1 text-xs">
                {Object.entries(item?.stats)?.slice(0, 3)?.map(([stat, value]) => (
                  <div key={stat} className="text-center">
                    <div className="text-muted-foreground capitalize">{stat?.slice(0, 3)}</div>
                    <div className="text-foreground font-mono">{value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Activity Optimization Indicator */}
        {!isEmpty && item?.optimizedFor && item?.optimizedFor?.includes(selectedActivity) && (
          <div className="absolute top-2 right-2 w-3 h-3 bg-accent rounded-full border-2 border-background"></div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Weapons Section */}
      <div>
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Sword" size={20} className="mr-2 text-primary" />
          Weapons
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {weaponSlots?.map(renderSlot)}
        </div>
      </div>
      {/* Armor Section */}
      <div>
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Shield" size={20} className="mr-2 text-primary" />
          Armor
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {armorSlots?.map(renderSlot)}
        </div>
      </div>
    </div>
  );
};

export default LoadoutGrid;