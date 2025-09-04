import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ItemDetailModal = ({ item, isOpen, onClose, onWishlistToggle, isInWishlist }) => {
  const [activeTab, setActiveTab] = useState('stats');

  if (!isOpen || !item) return null;

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

  const getStatBarWidth = (value, maxValue = 100) => {
    return Math.min((value / maxValue) * 100, 100);
  };

  const tabs = [
    { id: 'stats', label: 'Stats', icon: 'BarChart3' },
    { id: 'perks', label: 'Perks', icon: 'Zap' },
    { id: 'lore', label: 'Lore', icon: 'BookOpen' },
    { id: 'rolls', label: 'God Rolls', icon: 'Star' }
  ];

  const mockGodRolls = [
    {
      id: 1,
      name: 'PvE God Roll',
      description: 'Optimal for PvE content with maximum damage output',
      perks: ['Outlaw', 'Rampage', 'Tactical Mag', 'Arrowhead Brake'],
      votes: 1247,
      rating: 4.8
    },
    {
      id: 2,
      name: 'PvP God Roll',
      description: 'Perfect for Crucible with enhanced stability and range',
      perks: ['Rapid Hit', 'Kill Clip', 'Ricochet Rounds', 'Smallbore'],
      votes: 892,
      rating: 4.6
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Image
                src={item?.icon}
                alt={item?.name}
                className="w-16 h-16 rounded-lg"
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
            <div>
              <h2 
                className="text-xl font-bold mb-1"
                style={{ color: getRarityColor(item?.rarity) }}
              >
                {item?.name}
              </h2>
              <p className="text-muted-foreground capitalize">
                {item?.type} • {item?.slot} • {item?.rarity}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <Icon name="Star" size={16} className="text-yellow-400" />
                  <span className="font-mono">{item?.communityRating?.toFixed(1)}</span>
                  <span className="text-muted-foreground">({item?.ratingCount} votes)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Zap" size={16} className="text-primary" />
                  <span className="font-mono">{item?.powerLevel}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={isInWishlist ? "default" : "outline"}
              onClick={() => onWishlistToggle(item?.id)}
              iconName={isInWishlist ? "Star" : "StarOff"}
              iconPosition="left"
            >
              {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex space-x-1 p-1">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Primary Stats */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Primary Stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(item?.stats)?.map(([statName, value]) => (
                    <div key={statName} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium capitalize">
                          {statName?.replace(/([A-Z])/g, ' $1')?.trim()}
                        </span>
                        <span className="font-mono text-primary">
                          {formatStatValue(value)}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getStatBarWidth(value)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{item?.powerLevel}</div>
                  <div className="text-xs text-muted-foreground">Power Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{item?.communityRating?.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{item?.metaScore}%</div>
                  <div className="text-xs text-muted-foreground">Meta Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{item?.ratingCount}</div>
                  <div className="text-xs text-muted-foreground">Reviews</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'perks' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Available Perks</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item?.perks?.map((perk, index) => (
                  <div key={index} className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <Icon name="Zap" size={20} className="text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{perk}</h4>
                        <p className="text-sm text-muted-foreground">
                          Enhanced weapon performance and unique abilities
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'lore' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Lore & Description</h3>
              <div className="bg-muted p-6 rounded-lg">
                <p className="text-foreground leading-relaxed">
                  {item?.description || `"${item?.name}" - A legendary weapon forged in the fires of ancient battles. This weapon has seen countless conflicts across the solar system, from the red sands of Mars to the frozen wastes of Europa.\n\nIts unique design incorporates both Golden Age technology and modern Guardian innovations, making it a formidable tool in the right hands. The weapon's history is written in the scars along its barrel and the worn grip that has known many warriors.\n\nThose who wield this weapon speak of its reliability in the darkest moments, when the Light seems distant and hope grows thin. It has turned the tide of battles and saved countless lives, earning its place among the most revered weapons in Guardian arsenals.`}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'rolls' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Community God Rolls</h3>
              <div className="space-y-4">
                {mockGodRolls?.map((roll) => (
                  <div key={roll?.id} className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-primary">{roll?.name}</h4>
                        <p className="text-sm text-muted-foreground">{roll?.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <Icon name="Star" size={14} className="text-yellow-400" />
                          <span className="font-mono text-sm">{roll?.rating}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{roll?.votes} votes</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {roll?.perks?.map((perk, index) => (
                        <span
                          key={index}
                          className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm"
                        >
                          {perk}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;