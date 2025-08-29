import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterPanel = ({ isOpen, onClose, filters, onFilterChange, itemCounts }) => {
  const [expandedSections, setExpandedSections] = useState({
    weaponType: true,
    damageType: true,
    rarity: true,
    season: false,
    perks: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev?.[section]
    }));
  };

  const weaponTypes = [
    { id: 'auto-rifle', label: 'Auto Rifle', count: 47 },
    { id: 'hand-cannon', label: 'Hand Cannon', count: 38 },
    { id: 'pulse-rifle', label: 'Pulse Rifle', count: 42 },
    { id: 'scout-rifle', label: 'Scout Rifle', count: 31 },
    { id: 'submachine-gun', label: 'Submachine Gun', count: 29 },
    { id: 'shotgun', label: 'Shotgun', count: 26 },
    { id: 'sniper-rifle', label: 'Sniper Rifle', count: 24 },
    { id: 'fusion-rifle', label: 'Fusion Rifle', count: 22 },
    { id: 'rocket-launcher', label: 'Rocket Launcher', count: 18 },
    { id: 'machine-gun', label: 'Machine Gun', count: 15 }
  ];

  const damageTypes = [
    { id: 'kinetic', label: 'Kinetic', count: 89, color: '#FFFFFF' },
    { id: 'arc', label: 'Arc', count: 76, color: '#79BBFF' },
    { id: 'solar', label: 'Solar', count: 82, color: '#FF7B00' },
    { id: 'void', label: 'Void', count: 71, color: '#B084CC' },
    { id: 'stasis', label: 'Stasis', count: 34, color: '#4D88FF' },
    { id: 'strand', label: 'Strand', count: 28, color: '#00FF88' }
  ];

  const rarities = [
    { id: 'exotic', label: 'Exotic', count: 45, color: '#CEAE33' },
    { id: 'legendary', label: 'Legendary', count: 287, color: '#522F65' },
    { id: 'rare', label: 'Rare', count: 156, color: '#5076A3' },
    { id: 'uncommon', label: 'Uncommon', count: 89, color: '#366F42' }
  ];

  const seasons = [
    { id: 'season-23', label: 'Season of the Wish', count: 24 },
    { id: 'season-22', label: 'Season of the Witch', count: 28 },
    { id: 'season-21', label: 'Season of the Deep', count: 31 },
    { id: 'season-20', label: 'Season of Defiance', count: 26 },
    { id: 'lightfall', label: 'Lightfall', count: 42 },
    { id: 'season-19', label: 'Season of the Seraph', count: 29 }
  ];

  const popularPerks = [
    { id: 'outlaw', label: 'Outlaw', count: 67 },
    { id: 'rampage', label: 'Rampage', count: 54 },
    { id: 'kill-clip', label: 'Kill Clip', count: 48 },
    { id: 'rapid-hit', label: 'Rapid Hit', count: 43 },
    { id: 'feeding-frenzy', label: 'Feeding Frenzy', count: 39 },
    { id: 'explosive-payload', label: 'Explosive Payload', count: 36 }
  ];

  const handleFilterToggle = (category, value) => {
    const currentFilters = filters?.[category] || [];
    const newFilters = currentFilters?.includes(value)
      ? currentFilters?.filter(f => f !== value)
      : [...currentFilters, value];
    
    onFilterChange(category, newFilters);
  };

  const clearAllFilters = () => {
    onFilterChange('weaponType', []);
    onFilterChange('damageType', []);
    onFilterChange('rarity', []);
    onFilterChange('season', []);
    onFilterChange('perks', []);
  };

  const getActiveFilterCount = () => {
    return Object.values(filters)?.reduce((total, filterArray) => total + filterArray?.length, 0);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      )}
      {/* Filter Panel */}
      <div className={`
        fixed md:static top-0 left-0 h-full w-80 bg-card border-r border-border z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        overflow-y-auto
      `}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Icon name="Filter" size={20} className="text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Filters</h2>
              {getActiveFilterCount() > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  {getActiveFilterCount()}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Clear All
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="md:hidden"
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
          </div>

          {/* Weapon Type Filter */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('weaponType')}
              className="flex items-center justify-between w-full p-2 text-left hover:bg-muted rounded-md transition-colors"
            >
              <span className="font-medium text-foreground">Weapon Type</span>
              <Icon 
                name={expandedSections?.weaponType ? "ChevronUp" : "ChevronDown"} 
                size={16} 
              />
            </button>
            {expandedSections?.weaponType && (
              <div className="mt-2 space-y-2 pl-2">
                {weaponTypes?.map((type) => (
                  <div key={type?.id} className="flex items-center justify-between">
                    <Checkbox
                      label={type?.label}
                      checked={filters?.weaponType?.includes(type?.id) || false}
                      onChange={() => handleFilterToggle('weaponType', type?.id)}
                      size="sm"
                    />
                    <span className="text-xs text-muted-foreground font-mono">
                      {type?.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Damage Type Filter */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('damageType')}
              className="flex items-center justify-between w-full p-2 text-left hover:bg-muted rounded-md transition-colors"
            >
              <span className="font-medium text-foreground">Damage Type</span>
              <Icon 
                name={expandedSections?.damageType ? "ChevronUp" : "ChevronDown"} 
                size={16} 
              />
            </button>
            {expandedSections?.damageType && (
              <div className="mt-2 space-y-2 pl-2">
                {damageTypes?.map((type) => (
                  <div key={type?.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={filters?.damageType?.includes(type?.id) || false}
                        onChange={() => handleFilterToggle('damageType', type?.id)}
                        size="sm"
                      />
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full border border-border"
                          style={{ backgroundColor: type?.color }}
                        />
                        <span className="text-sm text-foreground">{type?.label}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {type?.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rarity Filter */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('rarity')}
              className="flex items-center justify-between w-full p-2 text-left hover:bg-muted rounded-md transition-colors"
            >
              <span className="font-medium text-foreground">Rarity</span>
              <Icon 
                name={expandedSections?.rarity ? "ChevronUp" : "ChevronDown"} 
                size={16} 
              />
            </button>
            {expandedSections?.rarity && (
              <div className="mt-2 space-y-2 pl-2">
                {rarities?.map((rarity) => (
                  <div key={rarity?.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={filters?.rarity?.includes(rarity?.id) || false}
                        onChange={() => handleFilterToggle('rarity', rarity?.id)}
                        size="sm"
                      />
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded border border-border"
                          style={{ backgroundColor: rarity?.color }}
                        />
                        <span className="text-sm text-foreground">{rarity?.label}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {rarity?.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Season Filter */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('season')}
              className="flex items-center justify-between w-full p-2 text-left hover:bg-muted rounded-md transition-colors"
            >
              <span className="font-medium text-foreground">Season</span>
              <Icon 
                name={expandedSections?.season ? "ChevronUp" : "ChevronDown"} 
                size={16} 
              />
            </button>
            {expandedSections?.season && (
              <div className="mt-2 space-y-2 pl-2">
                {seasons?.map((season) => (
                  <div key={season?.id} className="flex items-center justify-between">
                    <Checkbox
                      label={season?.label}
                      checked={filters?.season?.includes(season?.id) || false}
                      onChange={() => handleFilterToggle('season', season?.id)}
                      size="sm"
                    />
                    <span className="text-xs text-muted-foreground font-mono">
                      {season?.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Perks Filter */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('perks')}
              className="flex items-center justify-between w-full p-2 text-left hover:bg-muted rounded-md transition-colors"
            >
              <span className="font-medium text-foreground">Popular Perks</span>
              <Icon 
                name={expandedSections?.perks ? "ChevronUp" : "ChevronDown"} 
                size={16} 
              />
            </button>
            {expandedSections?.perks && (
              <div className="mt-2 space-y-2 pl-2">
                {popularPerks?.map((perk) => (
                  <div key={perk?.id} className="flex items-center justify-between">
                    <Checkbox
                      label={perk?.label}
                      checked={filters?.perks?.includes(perk?.id) || false}
                      onChange={() => handleFilterToggle('perks', perk?.id)}
                      size="sm"
                    />
                    <span className="text-xs text-muted-foreground font-mono">
                      {perk?.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;