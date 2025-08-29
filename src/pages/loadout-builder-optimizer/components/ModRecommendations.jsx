import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ModRecommendations = ({ selectedActivity, currentLoadout, onModSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock mod data
  const mockMods = [
    {
      id: 'protective-light',
      name: 'Protective Light',
      type: 'Combat',
      category: 'defensive',
      cost: 2,
      element: 'void',
      icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=50&h=50&fit=crop',
      description: 'While Charged with Light, you take significantly less damage from combatants while your shields are broken.',
      synergy: ['High Energy Fire', 'Taking Charge'],
      seasonal: false,
      recommended: true,
      activities: ['pve', 'raid', 'dungeon']
    },
    {
      id: 'high-energy-fire',
      name: 'High-Energy Fire',
      type: 'Combat',
      category: 'offensive',
      cost: 4,
      element: 'solar',
      icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=50&h=50&fit=crop',
      description: 'While Charged with Light, weapon final blows grant you bonus damage for a short duration.',
      synergy: ['Taking Charge', 'Stacks on Stacks'],
      seasonal: false,
      recommended: true,
      activities: ['pve', 'pvp', 'raid']
    },
    {
      id: 'elemental-charge',
      name: 'Elemental Charge',
      type: 'Combat',
      category: 'utility',
      cost: 3,
      element: 'arc',
      icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=50&h=50&fit=crop',
      description: 'Become Charged with Light by picking up an elemental well that matches your subclass energy type.',
      synergy: ['Elemental Armaments', 'Well of Life'],
      seasonal: true,
      recommended: false,
      activities: ['pve', 'raid']
    },
    {
      id: 'powerful-friends',
      name: 'Powerful Friends',
      type: 'Combat',
      category: 'utility',
      cost: 4,
      element: 'arc',
      icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=50&h=50&fit=crop',
      description: 'When you become Charged with Light, nearby allies also become Charged with Light. +20 Mobility.',
      synergy: ['Radiant Light', 'Taking Charge'],
      seasonal: false,
      recommended: true,
      activities: ['raid', 'dungeon', 'pvp']
    },
    {
      id: 'radiant-light',
      name: 'Radiant Light',
      type: 'Combat',
      category: 'utility',
      cost: 3,
      element: 'solar',
      icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=50&h=50&fit=crop',
      description: 'Casting your Super causes nearby allies to become Charged with Light. +20 Strength.',
      synergy: ['Powerful Friends', 'High Energy Fire'],
      seasonal: false,
      recommended: false,
      activities: ['raid', 'dungeon']
    }
  ];

  const categories = [
    { value: 'all', label: 'All Mods', icon: 'Grid3x3' },
    { value: 'offensive', label: 'Offensive', icon: 'Sword' },
    { value: 'defensive', label: 'Defensive', icon: 'Shield' },
    { value: 'utility', label: 'Utility', icon: 'Settings' }
  ];

  const filteredMods = mockMods?.filter(mod => {
    const matchesCategory = selectedCategory === 'all' || mod?.category === selectedCategory;
    const matchesActivity = mod?.activities?.includes(selectedActivity);
    return matchesCategory && matchesActivity;
  });

  const recommendedMods = filteredMods?.filter(mod => mod?.recommended);
  const otherMods = filteredMods?.filter(mod => !mod?.recommended);

  const getElementColor = (element) => {
    switch (element) {
      case 'solar': return 'text-orange-400 bg-orange-400/20';
      case 'arc': return 'text-blue-400 bg-blue-400/20';
      case 'void': return 'text-purple-400 bg-purple-400/20';
      case 'stasis': return 'text-cyan-400 bg-cyan-400/20';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const ModCard = ({ mod, isRecommended = false }) => (
    <div className={`p-4 rounded-lg border transition-tactical hover:shadow-tactical cursor-pointer ${
      isRecommended ? 'border-primary bg-primary/5' : 'border-border bg-card'
    }`}>
      <div className="flex items-start space-x-3">
        {/* Mod Icon */}
        <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={mod?.icon}
            alt={mod?.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Mod Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-foreground">{mod?.name}</h4>
            <div className="flex items-center space-x-2">
              {mod?.seasonal && (
                <span className="px-1.5 py-0.5 text-xs bg-accent/20 text-accent rounded">
                  Seasonal
                </span>
              )}
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getElementColor(mod?.element)}`}>
                {mod?.cost}
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {mod?.description}
          </p>

          {/* Synergy */}
          {mod?.synergy && mod?.synergy?.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-muted-foreground mb-1">Synergizes with:</div>
              <div className="flex flex-wrap gap-1">
                {mod?.synergy?.slice(0, 2)?.map((synergyMod) => (
                  <span
                    key={synergyMod}
                    className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded"
                  >
                    {synergyMod}
                  </span>
                ))}
                {mod?.synergy?.length > 2 && (
                  <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded">
                    +{mod?.synergy?.length - 2}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {mod?.activities?.slice(0, 3)?.map((activity) => (
                <span
                  key={activity}
                  className="px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded uppercase"
                >
                  {activity}
                </span>
              ))}
            </div>
            <Button
              variant="outline"
              size="xs"
              iconName="Plus"
              onClick={() => onModSelect(mod)}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-semibold text-foreground flex items-center">
          <Icon name="Zap" size={20} className="mr-2 text-primary" />
          Mod Recommendations
        </h3>
        <div className="text-sm text-muted-foreground">
          {filteredMods?.length} available
        </div>
      </div>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories?.map((category) => (
          <Button
            key={category?.value}
            variant={selectedCategory === category?.value ? 'default' : 'outline'}
            size="sm"
            iconName={category?.icon}
            iconPosition="left"
            onClick={() => setSelectedCategory(category?.value)}
          >
            {category?.label}
          </Button>
        ))}
      </div>
      {/* Recommended Mods */}
      {recommendedMods?.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Icon name="Star" size={16} className="mr-2 text-warning" />
            <h4 className="text-sm font-medium text-foreground">Recommended for {selectedActivity?.toUpperCase()}</h4>
          </div>
          <div className="space-y-3">
            {recommendedMods?.map((mod) => (
              <ModCard key={mod?.id} mod={mod} isRecommended />
            ))}
          </div>
        </div>
      )}
      {/* Other Mods */}
      {otherMods?.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">Other Available Mods</h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {otherMods?.map((mod) => (
              <ModCard key={mod?.id} mod={mod} />
            ))}
          </div>
        </div>
      )}
      {filteredMods?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Zap" size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No mods available for this activity</p>
        </div>
      )}
    </div>
  );
};

export default ModRecommendations;