import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ComparisonPanel = ({ items, isOpen, onClose, onRemoveItem }) => {
  if (!isOpen || items?.length === 0) return null;

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

  const formatStatValue = (value) => {
    return Math.round(value);
  };

  const getStatComparison = (statName, items) => {
    const values = items?.map(item => item?.stats?.[statName] || 0);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    
    return values?.map(value => ({
      value,
      isHighest: value === maxValue && maxValue !== minValue,
      isLowest: value === minValue && maxValue !== minValue
    }));
  };

  // Get all unique stats across all items
  const allStats = [...new Set(items.flatMap(item => Object.keys(item.stats || {})))];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <Icon name="GitCompare" size={24} className="text-primary" />
            <h2 className="text-xl font-bold">Item Comparison</h2>
            <span className="text-muted-foreground">({items?.length} items)</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Comparison Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-4 border-b border-border min-w-32">
                    <span className="text-muted-foreground">Property</span>
                  </th>
                  {items?.map((item, index) => (
                    <th key={item?.id} className="text-center p-4 border-b border-border min-w-48">
                      <div className="space-y-3">
                        {/* Item Image */}
                        <div className="relative mx-auto w-16 h-16">
                          <Image
                            src={item?.icon}
                            alt={item?.name}
                            className="w-full h-full rounded-lg"
                          />
                          <div 
                            className="absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"
                            style={{ backgroundColor: getDamageTypeColor(item?.damageType) }}
                          >
                            <Icon 
                              name={item?.damageType === 'kinetic' ? 'Circle' : 'Zap'} 
                              size={12} 
                              color={item?.damageType === 'kinetic' ? '#000' : '#fff'} 
                            />
                          </div>
                        </div>
                        
                        {/* Item Name */}
                        <div>
                          <h3 
                            className="font-semibold text-sm leading-tight"
                            style={{ color: getRarityColor(item?.rarity) }}
                          >
                            {item?.name}
                          </h3>
                          <p className="text-xs text-muted-foreground capitalize">
                            {item?.type}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveItem(item?.id)}
                          className="text-xs"
                        >
                          <Icon name="X" size={14} className="mr-1" />
                          Remove
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Basic Info */}
                <tr>
                  <td className="p-4 border-b border-border font-medium">Power Level</td>
                  {items?.map((item) => (
                    <td key={`${item?.id}-power`} className="p-4 border-b border-border text-center">
                      <span className="font-mono text-primary">{item?.powerLevel}</span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 border-b border-border font-medium">Rarity</td>
                  {items?.map((item) => (
                    <td key={`${item?.id}-rarity`} className="p-4 border-b border-border text-center">
                      <span 
                        className="capitalize font-medium"
                        style={{ color: getRarityColor(item?.rarity) }}
                      >
                        {item?.rarity}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 border-b border-border font-medium">Damage Type</td>
                  {items?.map((item) => (
                    <td key={`${item?.id}-damage`} className="p-4 border-b border-border text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: getDamageTypeColor(item?.damageType) }}
                        />
                        <span className="capitalize">{item?.damageType}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 border-b border-border font-medium">Community Rating</td>
                  {items?.map((item) => (
                    <td key={`${item?.id}-rating`} className="p-4 border-b border-border text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Icon name="Star" size={14} className="text-yellow-400" />
                        <span className="font-mono">{item?.communityRating?.toFixed(1)}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Stats Comparison */}
                {allStats?.map((statName) => {
                  const comparisons = getStatComparison(statName, items);
                  return (
                    <tr key={statName}>
                      <td className="p-4 border-b border-border font-medium capitalize">
                        {statName?.replace(/([A-Z])/g, ' $1')?.trim()}
                      </td>
                      {items?.map((item, index) => {
                        const comparison = comparisons?.[index];
                        const value = item?.stats?.[statName] || 0;
                        return (
                          <td key={`${item?.id}-${statName}`} className="p-4 border-b border-border text-center">
                            <div className="space-y-2">
                              <span 
                                className={`font-mono ${
                                  comparison?.isHighest ? 'text-green-400 font-bold' : comparison?.isLowest ?'text-red-400' : 'text-foreground'
                                }`}
                              >
                                {formatStatValue(value)}
                                {comparison?.isHighest && ' ↑'}
                                {comparison?.isLowest && ' ↓'}
                              </span>
                              <div className="w-full bg-muted rounded-full h-1">
                                <div
                                  className={`h-1 rounded-full transition-all duration-300 ${
                                    comparison?.isHighest ? 'bg-green-400' : comparison?.isLowest ?'bg-red-400' : 'bg-primary'
                                  }`}
                                  style={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Perks Comparison */}
                <tr>
                  <td className="p-4 border-b border-border font-medium">Notable Perks</td>
                  {items?.map((item) => (
                    <td key={`${item?.id}-perks`} className="p-4 border-b border-border text-center">
                      <div className="space-y-1">
                        {(item?.perks || [])?.slice(0, 3)?.map((perk, index) => (
                          <div
                            key={index}
                            className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded"
                          >
                            {perk}
                          </div>
                        ))}
                        {(item?.perks || [])?.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{item?.perks?.length - 3} more
                          </div>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Legend</h4>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-green-400 font-bold">↑</span>
                <span>Highest value</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-red-400">↓</span>
                <span>Lowest value</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span>Normal stat bar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonPanel;