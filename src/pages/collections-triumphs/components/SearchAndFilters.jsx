import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const SearchAndFilters = ({ 
  searchTerm, 
  onSearchChange, 
  filters, 
  onFilterChange, 
  activeTab 
}) => {
  const completionOptions = [
    { value: 'all', label: 'All Items' },
    { value: 'completed', label: 'Completed Only' },
    { value: 'incomplete', label: 'Incomplete Only' }
  ];

  const rarityOptions = [
    { value: 'all', label: 'All Rarities' },
    { value: 'common', label: 'Common' },
    { value: 'uncommon', label: 'Uncommon' },
    { value: 'rare', label: 'Rare' },
    { value: 'legendary', label: 'Legendary' },
    { value: 'exotic', label: 'Exotic' }
  ];

  const sourceOptions = [
    { value: 'all', label: 'All Sources' },
    { value: 'strikes', label: 'Strikes' },
    { value: 'crucible', label: 'Crucible' },
    { value: 'gambit', label: 'Gambit' },
    { value: 'raids', label: 'Raids' },
    { value: 'dungeons', label: 'Dungeons' },
    { value: 'seasonal', label: 'Seasonal' },
    { value: 'eververse', label: 'Eververse' }
  ];

  const categoryOptions = activeTab === 'collections' ? [
    { value: 'all', label: 'All Categories' },
    { value: 'weapons', label: 'Weapons' },
    { value: 'armor', label: 'Armor' },
    { value: 'sparrows', label: 'Sparrows' },
    { value: 'ships', label: 'Ships' },
    { value: 'emblems', label: 'Emblems' },
    { value: 'shaders', label: 'Shaders' }
  ] : [
    { value: 'all', label: 'All Categories' },
    { value: 'destinations', label: 'Destinations' },
    { value: 'activities', label: 'Activities' },
    { value: 'seasonal', label: 'Seasonal' },
    { value: 'account', label: 'Account' },
    { value: 'combat', label: 'Combat' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Input
          type="search"
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => onSearchChange(e?.target?.value)}
          className="pl-10"
        />
        <Icon 
          name="Search" 
          size={18} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
        />
      </div>
      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          label="Category"
          options={categoryOptions}
          value={filters?.category}
          onChange={(value) => onFilterChange('category', value)}
        />

        <Select
          label="Completion"
          options={completionOptions}
          value={filters?.completion}
          onChange={(value) => onFilterChange('completion', value)}
        />

        {activeTab === 'collections' && (
          <Select
            label="Rarity"
            options={rarityOptions}
            value={filters?.rarity}
            onChange={(value) => onFilterChange('rarity', value)}
          />
        )}

        <Select
          label="Source"
          options={sourceOptions}
          value={filters?.source}
          onChange={(value) => onFilterChange('source', value)}
        />
      </div>
      {/* Additional Filters */}
      <div className="flex flex-wrap gap-4 pt-2 border-t border-border">
        <Checkbox
          label="Show only new items"
          checked={filters?.showNewOnly}
          onChange={(e) => onFilterChange('showNewOnly', e?.target?.checked)}
        />
        
        {activeTab === 'triumphs' && (
          <Checkbox
            label="Hide completed"
            checked={filters?.hideCompleted}
            onChange={(e) => onFilterChange('hideCompleted', e?.target?.checked)}
          />
        )}
        
        <Checkbox
          label="Seasonal content only"
          checked={filters?.seasonalOnly}
          onChange={(e) => onFilterChange('seasonalOnly', e?.target?.checked)}
        />
      </div>
      {/* Active Filters Summary */}
      {(searchTerm || Object.values(filters)?.some(filter => 
        filter !== 'all' && filter !== false && filter !== ''
      )) && (
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Filter" size={14} />
            <span>Filters active</span>
          </div>
          <button
            onClick={() => {
              onSearchChange('');
              onFilterChange('category', 'all');
              onFilterChange('completion', 'all');
              onFilterChange('rarity', 'all');
              onFilterChange('source', 'all');
              onFilterChange('showNewOnly', false);
              onFilterChange('hideCompleted', false);
              onFilterChange('seasonalOnly', false);
            }}
            className="text-sm text-accent hover:text-accent/80 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters;