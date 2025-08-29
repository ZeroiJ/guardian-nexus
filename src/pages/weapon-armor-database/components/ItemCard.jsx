import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ItemCard = ({ item, onSelect, onWishlistToggle, onCompareToggle, isSelected, isInWishlist, isInComparison }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getDamageTypeColor = (damageType) => {
    const colors = {
      kinetic: '#FFFFFF',
      arc: '#79BBFF',
      solar: '#FF7B00',
      void: '#B084CC',
      stasis: '#4D88FF',
      strand: '#00FF88'
    };
    return colors?.[damageType] || '#FFFFFF';
  };

  const getRarityColor = (rarity) => {
    const colors = {
      exotic: '#CEAE33',
      legendary: '#522F65',
      rare: '#5076A3',
      uncommon: '#366F42',
      common: '#C3C3C3'
    };
    return colors?.[rarity] || '#C3C3C3';
  };

  const getRarityBorder = (rarity) => {
    const borders = {
      exotic: 'border-yellow-500',
      legendary: 'border-purple-500',
      rare: 'border-blue-500',
      uncommon: 'border-green-500',
      common: 'border-gray-500'
    };
    return borders?.[rarity] || 'border-gray-500';
  };

  const formatStatValue = (value) => {
    return Math.round(value);
  };

  return (
    <div
      className={`
        relative bg-card border rounded-lg overflow-hidden transition-all duration-200 hover-scale
        ${getRarityBorder(item?.rarity)} ${isSelected ? 'ring-2 ring-primary' : ''}
        ${isHovered ? 'shadow-lg' : 'shadow-sm'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Item Image */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        <Image
          src={item?.icon}
          alt={item?.name}
          className="w-full h-full object-cover"
        />
        
        {/* Damage Type Indicator */}
        <div 
          className="absolute top-2 left-2 w-6 h-6 rounded-full border-2 border-white/20 flex items-center justify-center"
          style={{ backgroundColor: getDamageTypeColor(item?.damageType) }}
        >
          <Icon 
            name={item?.damageType === 'kinetic' ? 'Circle' : 'Zap'} 
            size={12} 
            color={item?.damageType === 'kinetic' ? '#000' : '#fff'} 
          />
        </div>

        {/* Power Level */}
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-mono px-2 py-1 rounded">
          {item?.powerLevel}
        </div>

        {/* Wishlist & Compare Actions */}
        <div className="absolute bottom-2 right-2 flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e?.stopPropagation();
              onWishlistToggle(item?.id);
            }}
            className={`h-8 w-8 bg-black/50 hover:bg-black/70 ${
              isInWishlist ? 'text-yellow-400' : 'text-white'
            }`}
          >
            <Icon name={isInWishlist ? 'Star' : 'StarOff'} size={14} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e?.stopPropagation();
              onCompareToggle(item?.id);
            }}
            className={`h-8 w-8 bg-black/50 hover:bg-black/70 ${
              isInComparison ? 'text-primary' : 'text-white'
            }`}
          >
            <Icon name="GitCompare" size={14} />
          </Button>
        </div>

        {/* God Roll Indicator */}
        {item?.isGodRoll && (
          <div className="absolute bottom-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
            GOD ROLL
          </div>
        )}
      </div>
      {/* Item Details */}
      <div className="p-3">
        {/* Name and Type */}
        <div className="mb-2">
          <h3 
            className="font-semibold text-sm leading-tight mb-1 line-clamp-2"
            style={{ color: getRarityColor(item?.rarity) }}
          >
            {item?.name}
          </h3>
          <p className="text-xs text-muted-foreground capitalize">
            {item?.type} • {item?.slot}
          </p>
        </div>

        {/* Stats Preview */}
        {item?.stats && (
          <div className="mb-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(item?.stats)?.slice(0, 4)?.map(([statName, value]) => (
                <div key={statName} className="flex justify-between">
                  <span className="text-muted-foreground capitalize">
                    {statName?.replace(/([A-Z])/g, ' $1')?.trim()}
                  </span>
                  <span className="font-mono text-foreground">
                    {formatStatValue(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Perks Preview */}
        {item?.perks && item?.perks?.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {item?.perks?.slice(0, 2)?.map((perk, index) => (
                <span
                  key={index}
                  className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded truncate"
                  title={perk}
                >
                  {perk}
                </span>
              ))}
              {item?.perks?.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{item?.perks?.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Community Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Icon name="Star" size={12} className="text-yellow-400" />
            <span className="text-xs font-mono text-foreground">
              {item?.communityRating?.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({item?.ratingCount})
            </span>
          </div>
          
          {item?.metaScore && (
            <div className="flex items-center space-x-1">
              <Icon name="TrendingUp" size={12} className="text-primary" />
              <span className="text-xs font-mono text-primary">
                {item?.metaScore}%
              </span>
            </div>
          )}
        </div>

        {/* Click to View Details */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelect(item)}
          className="w-full mt-3 text-xs"
        >
          View Details
          <Icon name="ChevronRight" size={14} className="ml-1" />
        </Button>
      </div>
      {/* Selection Overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-primary rounded-lg pointer-events-none" />
      )}
    </div>
  );
};

export default ItemCard;