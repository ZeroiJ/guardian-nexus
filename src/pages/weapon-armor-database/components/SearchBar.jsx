import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const SearchBar = ({ searchQuery, onSearchChange, onFilterToggle, sortBy, onSortChange, resultCount }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)', icon: 'ArrowUpAZ' },
    { value: 'power', label: 'Power Level', icon: 'Zap' },
    { value: 'rating', label: 'Community Rating', icon: 'Star' },
    { value: 'meta', label: 'Meta Relevance', icon: 'TrendingUp' },
    { value: 'recent', label: 'Recently Added', icon: 'Clock' }
  ];

  const currentSort = sortOptions?.find(option => option?.value === sortBy) || sortOptions?.[0];

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    // Search is handled by onChange, but we can add additional logic here if needed
  };

  return (
    <div className="bg-card border-b border-border sticky top-16 z-30">
      <div className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <Icon 
                  name="Search" 
                  size={20} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
                />
                <Input
                  type="search"
                  placeholder="Search weapons and armor... (e.g., 'hand cannon void outlaw')"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e?.target?.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="pl-10 pr-12"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSearchChange('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  >
                    <Icon name="X" size={14} />
                  </Button>
                )}
              </div>
            </form>

            {/* Search Suggestions */}
            {isSearchFocused && searchQuery?.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-b-lg shadow-lg z-50 mt-1">
                <div className="p-2">
                  <div className="text-xs text-muted-foreground mb-2 px-2">Quick Suggestions</div>
                  <div className="space-y-1">
                    {[
                      'hand cannon solar',
                      'auto rifle arc outlaw',
                      'shotgun void',
                      'sniper rifle kinetic',
                      'exotic armor titan'
                    ]?.filter(suggestion => 
                      suggestion?.toLowerCase()?.includes(searchQuery?.toLowerCase())
                    )?.slice(0, 5)?.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          onSearchChange(suggestion);
                          setIsSearchFocused(false);
                        }}
                        className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded transition-colors"
                      >
                        <Icon name="Search" size={14} className="inline mr-2 text-muted-foreground" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={onFilterToggle}
              iconName="Filter"
              iconPosition="left"
              className="md:hidden"
            >
              Filters
            </Button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e?.target?.value)}
                className="appearance-none bg-card border border-border rounded-md px-3 py-2 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {sortOptions?.map((option) => (
                  <option key={option?.value} value={option?.value}>
                    {option?.label}
                  </option>
                ))}
              </select>
              <Icon 
                name="ChevronDown" 
                size={16} 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" 
              />
            </div>

            {/* View Toggle */}
            <div className="hidden sm:flex items-center bg-muted rounded-md p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 data-[active=true]:bg-background data-[active=true]:shadow-sm"
                data-active="true"
              >
                <Icon name="Grid3X3" size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <Icon name="List" size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">{resultCount?.toLocaleString()}</span> items found
            </span>
            {searchQuery && (
              <span>
                for "<span className="font-medium text-foreground">{searchQuery}</span>"
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name={currentSort?.icon} size={16} />
            <span>Sorted by {currentSort?.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;