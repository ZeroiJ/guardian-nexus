import React, { useState, useEffect, useMemo } from 'react';
import Header from '../../components/ui/Header';
import FilterPanel from './components/FilterPanel';
import SearchBar from './components/SearchBar';
import ItemCard from './components/ItemCard';
import ItemDetailModal from './components/ItemDetailModal';
import ComparisonPanel from './components/ComparisonPanel';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const WeaponArmorDatabase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filters, setFilters] = useState({
    weaponType: [],
    damageType: [],
    rarity: [],
    season: [],
    perks: []
  });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const [comparisonItems, setComparisonItems] = useState([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  // Mock database items
  const mockItems = [
    {
      id: 1,
      name: "Fatebringer",
      type: "hand-cannon",
      slot: "primary",
      rarity: "legendary",
      damageType: "kinetic",
      powerLevel: 1810,
      icon: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
      communityRating: 4.8,
      ratingCount: 2847,
      metaScore: 92,
      isGodRoll: true,
      stats: {
        impact: 84,
        range: 46,
        stability: 51,
        handling: 38,
        reloadSpeed: 41,
        aimAssistance: 85
      },
      perks: ["Outlaw", "Explosive Payload", "Firefly", "Opening Shot"],
      description: "A legendary hand cannon that has become synonymous with precision and power among Guardians."
    },
    {
      id: 2,
      name: "Palindrome",
      type: "hand-cannon",
      slot: "primary",
      rarity: "legendary",
      damageType: "void",
      powerLevel: 1805,
      icon: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
      communityRating: 4.6,
      ratingCount: 1923,
      metaScore: 88,
      isGodRoll: false,
      stats: {
        impact: 84,
        range: 62,
        stability: 44,
        handling: 32,
        reloadSpeed: 38,
        aimAssistance: 70
      },
      perks: ["Rapid Hit", "Rangefinder", "Kill Clip", "Ricochet Rounds"]
    },
    {
      id: 3,
      name: "Gnawing Hunger",
      type: "auto-rifle",
      slot: "primary",
      rarity: "legendary",
      damageType: "void",
      powerLevel: 1798,
      icon: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
      communityRating: 4.4,
      ratingCount: 3156,
      metaScore: 76,
      isGodRoll: false,
      stats: {
        impact: 29,
        range: 42,
        stability: 61,
        handling: 48,
        reloadSpeed: 52,
        aimAssistance: 75
      },
      perks: ["Subsistence", "Rampage", "Tap the Trigger", "Armor-Piercing Rounds"]
    },
    {
      id: 4,
      name: "Ikelos SMG",
      type: "submachine-gun",
      slot: "primary",
      rarity: "legendary",
      damageType: "arc",
      powerLevel: 1812,
      icon: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
      communityRating: 4.7,
      ratingCount: 2234,
      metaScore: 85,
      isGodRoll: true,
      stats: {
        impact: 25,
        range: 35,
        stability: 54,
        handling: 62,
        reloadSpeed: 68,
        aimAssistance: 65
      },
      perks: ["Dynamic Sway Reduction", "Surrounded", "Threat Detector", "Seraph Rounds"]
    },
    {
      id: 5,
      name: "Falling Guillotine",
      type: "sword",
      slot: "heavy",
      rarity: "legendary",
      damageType: "void",
      powerLevel: 1815,
      icon: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
      communityRating: 4.9,
      ratingCount: 4567,
      metaScore: 95,
      isGodRoll: true,
      stats: {
        impact: 74,
        range: 46,
        stability: 41,
        handling: 35,
        chargeTime: 533,
        guardResistance: 50
      },
      perks: ["Relentless Strikes", "Whirlwind Blade", "Jagged Edge", "Swordmaster\'s Guard"]
    },
    {
      id: 6,
      name: "Witherhoard",
      type: "grenade-launcher",
      slot: "special",
      rarity: "exotic",
      damageType: "kinetic",
      powerLevel: 1820,
      icon: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
      communityRating: 4.8,
      ratingCount: 3891,
      metaScore: 91,
      isGodRoll: false,
      stats: {
        impact: 0,
        range: 50,
        stability: 24,
        handling: 72,
        reloadSpeed: 45,
        velocity: 72
      },
      perks: ["Primeval\'s Torment", "Silent Launch", "Blinding Grenades", "Auto-Loading Holster"]
    },
    {
      id: 7,
      name: "Austringer",
      type: "hand-cannon",
      slot: "primary",
      rarity: "legendary",
      damageType: "solar",
      powerLevel: 1808,
      icon: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
      communityRating: 4.5,
      ratingCount: 2156,
      metaScore: 82,
      isGodRoll: false,
      stats: {
        impact: 84,
        range: 58,
        stability: 48,
        handling: 41,
        reloadSpeed: 44,
        aimAssistance: 75
      },
      perks: ["Eye of the Storm", "Rangefinder", "Outlaw", "High-Caliber Rounds"]
    },
    {
      id: 8,
      name: "Beloved",
      type: "sniper-rifle",
      slot: "special",
      rarity: "legendary",
      damageType: "solar",
      powerLevel: 1803,
      icon: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
      communityRating: 4.6,
      ratingCount: 1876,
      metaScore: 87,
      isGodRoll: true,
      stats: {
        impact: 90,
        range: 68,
        stability: 41,
        handling: 44,
        reloadSpeed: 48,
        aimAssistance: 68
      },
      perks: ["Snapshot Sights", "Quickdraw", "No Distractions", "Accurized Rounds"]
    }
  ];

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = mockItems;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery?.toLowerCase();
      filtered = filtered?.filter(item =>
        item?.name?.toLowerCase()?.includes(query) ||
        item?.type?.toLowerCase()?.includes(query) ||
        item?.damageType?.toLowerCase()?.includes(query) ||
        item?.perks?.some(perk => perk?.toLowerCase()?.includes(query))
      );
    }

    // Apply category filters
    Object.entries(filters)?.forEach(([category, values]) => {
      if (values?.length > 0) {
        filtered = filtered?.filter(item => {
          switch (category) {
            case 'weaponType':
              return values?.includes(item?.type);
            case 'damageType':
              return values?.includes(item?.damageType);
            case 'rarity':
              return values?.includes(item?.rarity);
            case 'perks':
              return values?.some(perk => item?.perks?.some(itemPerk => 
                itemPerk?.toLowerCase()?.includes(perk?.toLowerCase())
              ));
            default:
              return true;
          }
        });
      }
    });

    // Apply sorting
    filtered?.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a?.name?.localeCompare(b?.name);
        case 'power':
          return b?.powerLevel - a?.powerLevel;
        case 'rating':
          return b?.communityRating - a?.communityRating;
        case 'meta':
          return (b?.metaScore || 0) - (a?.metaScore || 0);
        case 'recent':
          return b?.id - a?.id; // Mock recent by ID
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, filters, sortBy]);

  const handleFilterChange = (category, values) => {
    setFilters(prev => ({
      ...prev,
      [category]: values
    }));
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleWishlistToggle = (itemId) => {
    setWishlistItems(prev => {
      const newSet = new Set(prev);
      if (newSet?.has(itemId)) {
        newSet?.delete(itemId);
      } else {
        newSet?.add(itemId);
      }
      return newSet;
    });
  };

  const handleCompareToggle = (itemId) => {
    setComparisonItems(prev => {
      const item = mockItems?.find(i => i?.id === itemId);
      const exists = prev?.find(i => i?.id === itemId);
      
      if (exists) {
        return prev?.filter(i => i?.id !== itemId);
      } else if (prev?.length < 4) { // Limit to 4 items for comparison
        return [...prev, item];
      }
      return prev;
    });
  };

  const handleRemoveFromComparison = (itemId) => {
    setComparisonItems(prev => prev?.filter(i => i?.id !== itemId));
  };

  // Close filter panel on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsFilterPanelOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 flex">
        {/* Desktop Filter Panel */}
        <div className="hidden md:block">
          <FilterPanel
            isOpen={true}
            onClose={() => {}}
            filters={filters}
            onFilterChange={handleFilterChange}
            itemCounts={{}}
          />
        </div>

        {/* Mobile Filter Panel */}
        <FilterPanel
          isOpen={isFilterPanelOpen}
          onClose={() => setIsFilterPanelOpen(false)}
          filters={filters}
          onFilterChange={handleFilterChange}
          itemCounts={{}}
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Search Bar */}
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onFilterToggle={() => setIsFilterPanelOpen(true)}
            sortBy={sortBy}
            onSortChange={setSortBy}
            resultCount={filteredAndSortedItems?.length}
          />

          {/* Items Grid */}
          <div className="p-6">
            {filteredAndSortedItems?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {filteredAndSortedItems?.map((item) => (
                  <ItemCard
                    key={item?.id}
                    item={item}
                    onSelect={handleItemSelect}
                    onWishlistToggle={handleWishlistToggle}
                    onCompareToggle={handleCompareToggle}
                    isSelected={selectedItem?.id === item?.id}
                    isInWishlist={wishlistItems?.has(item?.id)}
                    isInComparison={comparisonItems?.some(i => i?.id === item?.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({
                      weaponType: [],
                      damageType: [],
                      rarity: [],
                      season: [],
                      perks: []
                    });
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Floating Comparison Button */}
      {comparisonItems?.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            variant="default"
            onClick={() => setIsComparisonOpen(true)}
            iconName="GitCompare"
            iconPosition="left"
            className="shadow-lg"
          >
            Compare ({comparisonItems?.length})
          </Button>
        </div>
      )}
      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedItem(null);
        }}
        onWishlistToggle={handleWishlistToggle}
        isInWishlist={selectedItem ? wishlistItems?.has(selectedItem?.id) : false}
      />
      {/* Comparison Panel */}
      <ComparisonPanel
        items={comparisonItems}
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        onRemoveItem={handleRemoveFromComparison}
      />
    </div>
  );
};

export default WeaponArmorDatabase;