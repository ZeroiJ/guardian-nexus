import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import CollectionCategory from './components/CollectionCategory';
import TriumphNode from './components/TriumphNode';
import SeasonalProgress from './components/SeasonalProgress';
import SearchAndFilters from './components/SearchAndFilters';

const CollectionsTriumphs = () => {
  const [activeTab, setActiveTab] = useState('collections');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [filters, setFilters] = useState({
    category: 'all',
    completion: 'all',
    rarity: 'all',
    source: 'all',
    showNewOnly: false,
    hideCompleted: false,
    seasonalOnly: false
  });

  // Mock Collections Data
  const collectionsData = [
    {
      id: 'weapons',
      name: 'Weapons',
      icon: 'Sword',
      items: [
        {
          id: 'w1',
          name: 'Fatebringer',
          icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
          rarity: 'Legendary',
          acquired: true,
          isNew: false,
          description: 'A legendary hand cannon from the Vault of Glass.',
          acquisitionHint: 'Complete Vault of Glass raid'
        },
        {
          id: 'w2',
          name: 'Vex Mythoclast',
          icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
          rarity: 'Exotic',
          acquired: true,
          isNew: true,
          description: 'An exotic fusion rifle that defies classification.',
          acquisitionHint: 'Rare drop from Atheon in Vault of Glass'
        },
        {
          id: 'w3',
          name: 'Vision of Confluence',
          icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
          rarity: 'Legendary',
          acquired: false,
          isNew: false,
          description: 'A legendary scout rifle with solar damage.',
          acquisitionHint: 'Complete Vault of Glass raid encounters'
        },
        {
          id: 'w4',
          name: 'Corrective Measure',
          icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
          rarity: 'Legendary',
          acquired: false,
          isNew: false,
          description: 'A legendary machine gun with void damage.',
          acquisitionHint: 'Complete Vault of Glass raid'
        }
      ]
    },
    {
      id: 'armor',
      name: 'Armor',
      icon: 'Shield',
      items: [
        {
          id: 'a1',
          name: 'Helm of Saint-14',
          icon: 'https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg?w=100&h=100&fit=crop',
          rarity: 'Exotic',
          acquired: true,
          isNew: false,
          description: 'An exotic Titan helmet that blinds enemies.',
          acquisitionHint: 'Complete Season of Dawn questline'
        },
        {
          id: 'a2',
          name: 'Celestial Nighthawk',
          icon: 'https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg?w=100&h=100&fit=crop',
          rarity: 'Exotic',
          acquired: false,
          isNew: false,
          description: 'An exotic Hunter helmet for Golden Gun.',
          acquisitionHint: 'Random exotic drop or Xur'
        }
      ]
    },
    {
      id: 'sparrows',
      name: 'Sparrows',
      icon: 'Zap',
      items: [
        {
          id: 's1',
          name: 'Always on Time',
          icon: 'https://images.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg?w=100&h=100&fit=crop',
          rarity: 'Exotic',
          acquired: true,
          isNew: false,
          description: 'The fastest sparrow in Destiny 2.',
          acquisitionHint: 'Complete Scourge of the Past raid'
        },
        {
          id: 's2',
          name: 'Micro Mini',
          icon: 'https://images.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg?w=100&h=100&fit=crop',
          rarity: 'Legendary',
          acquired: false,
          isNew: false,
          description: 'A compact racing sparrow.',
          acquisitionHint: 'Purchase from Eververse'
        }
      ]
    }
  ];

  // Mock Triumphs Data
  const triumphsData = [
    {
      id: 't1',
      name: 'Flawless Raider',
      icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
      description: 'Complete a raid without any member of your fireteam dying.',
      progress: 1,
      total: 1,
      points: 50,
      category: 'Raids',
      completionRate: 12,
      objectives: [
        {
          description: 'Complete any raid flawlessly',
          progress: 1,
          total: 1
        }
      ],
      rewards: ['Flawless Raider Title', 'Triumph Points'],
      lore: `The greatest victories are achieved not through individual prowess, but through perfect coordination and unwavering trust in one's fireteam.`
    },
    {
      id: 't2',name: 'Crucible Legend',icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',description: 'Reach Legend rank in Competitive Crucible.',progress: 2847,total: 5500,points: 100,category: 'Crucible',
      completionRate: 8,
      objectives: [
        {
          description: 'Earn Glory points in Competitive playlist',
          progress: 2847,
          total: 5500
        }
      ],
      rewards: ['Unbroken Title', 'Exclusive Emblem'],
      lore: `Only the most skilled Guardians can ascend to the pinnacle of Crucible competition.`
    },
    {
      id: 't3',name: 'Seasonal Champion',icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',description: 'Complete all seasonal challenges.',progress: 8,total: 12,points: 75,category: 'Seasonal',
      completionRate: 34,
      objectives: [
        {
          description: 'Complete weekly seasonal challenges',
          progress: 8,
          total: 12
        }
      ],
      rewards: ['Seasonal Title', 'Bright Dust'],
      lore: `Each season brings new trials that test the resolve and adaptability of every Guardian.`
    }
  ];

  // Mock Seasonal Data
  const seasonalData = {
    currentSeason: {
      name: 'Season of the Witch',
      description: 'Embrace the darkness and master new powers.',
      icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop'
    },
    timeRemaining: 1248, // hours
    seasonPass: {
      currentLevel: 87,
      currentXP: 45000,
      nextLevelXP: 100000,
      recentRewards: [
        {
          name: 'Ascendant Shard',
          icon: 'https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg?w=100&h=100&fit=crop',
          isPremium: false
        },
        {
          name: 'Exotic Ornament',
          icon: 'https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg?w=100&h=100&fit=crop',
          isPremium: true
        },
        {
          name: 'Enhancement Prism',
          icon: 'https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg?w=100&h=100&fit=crop',
          isPremium: false
        },
        {
          name: 'Bright Dust',
          icon: 'https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg?w=100&h=100&fit=crop',
          isPremium: false
        }
      ]
    },
    artifact: {
      powerBonus: 15,
      mods: [
        {
          name: 'Anti-Barrier',
          mods: [
            {
              name: 'Anti-Barrier Auto Rifle',
              icon: 'https://images.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg?w=100&h=100&fit=crop',
              cost: 1,
              unlocked: true
            },
            {
              name: 'Anti-Barrier Scout Rifle',
              icon: 'https://images.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg?w=100&h=100&fit=crop',
              cost: 2,
              unlocked: true
            },
            {
              name: 'Anti-Barrier Sniper Rifle',
              icon: 'https://images.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg?w=100&h=100&fit=crop',
              cost: 3,
              unlocked: false
            }
          ]
        },
        {
          name: 'Overload',
          mods: [
            {
              name: 'Overload Hand Cannon',
              icon: 'https://images.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg?w=100&h=100&fit=crop',
              cost: 1,
              unlocked: true
            },
            {
              name: 'Overload SMG',
              icon: 'https://images.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg?w=100&h=100&fit=crop',
              cost: 2,
              unlocked: false
            }
          ]
        }
      ]
    },
    weeklyChallenges: [
      {
        name: 'Strike Specialist',
        description: 'Complete 3 Nightfall strikes',
        progress: 2,
        total: 3,
        xpReward: 12000,
        completed: false
      },
      {
        name: 'Crucible Warrior',
        description: 'Win 7 Crucible matches',
        progress: 7,
        total: 7,
        xpReward: 15000,
        completed: true
      },
      {
        name: 'Gambit Champion',
        description: 'Complete 4 Gambit matches',
        progress: 1,
        total: 4,
        xpReward: 10000,
        completed: false
      }
    ]
  };

  const tabs = [
    { id: 'collections', label: 'Collections', icon: 'Package' },
    { id: 'triumphs', label: 'Triumphs', icon: 'Trophy' },
    { id: 'seasonal', label: 'Seasonal', icon: 'Calendar' }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev?.[categoryId]
    }));
  };

  // Filter and search logic
  const filteredCollections = useMemo(() => {
    return collectionsData?.filter(category => {
      if (filters?.category !== 'all' && category?.id !== filters?.category) return false;
      
      const filteredItems = category?.items?.filter(item => {
        if (searchTerm && !item?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())) return false;
        if (filters?.completion === 'completed' && !item?.acquired) return false;
        if (filters?.completion === 'incomplete' && item?.acquired) return false;
        if (filters?.rarity !== 'all' && item?.rarity?.toLowerCase() !== filters?.rarity) return false;
        if (filters?.showNewOnly && !item?.isNew) return false;
        return true;
      });

      return filteredItems?.length > 0;
    })?.map(category => ({
      ...category,
      items: category?.items?.filter(item => {
        if (searchTerm && !item?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())) return false;
        if (filters?.completion === 'completed' && !item?.acquired) return false;
        if (filters?.completion === 'incomplete' && item?.acquired) return false;
        if (filters?.rarity !== 'all' && item?.rarity?.toLowerCase() !== filters?.rarity) return false;
        if (filters?.showNewOnly && !item?.isNew) return false;
        return true;
      })
    }));
  }, [searchTerm, filters]);

  const filteredTriumphs = useMemo(() => {
    return triumphsData?.filter(triumph => {
      if (searchTerm && !triumph?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())) return false;
      if (filters?.category !== 'all' && triumph?.category?.toLowerCase() !== filters?.category) return false;
      if (filters?.completion === 'completed' && triumph?.progress < triumph?.total) return false;
      if (filters?.completion === 'incomplete' && triumph?.progress >= triumph?.total) return false;
      if (filters?.hideCompleted && triumph?.progress >= triumph?.total) return false;
      return true;
    });
  }, [searchTerm, filters]);

  return (
    <>
      <Helmet>
        <title>Collections & Triumphs - Guardian Nexus</title>
        <meta name="description" content="Track your Destiny 2 collections, triumphs, and seasonal progress with comprehensive achievement monitoring." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
                Collections & Triumphs
              </h1>
              <p className="text-muted-foreground">
                Track your achievements, collectibles, and seasonal progress across all Destiny 2 content.
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg w-fit">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-tactical ${
                    activeTab === tab?.id
                      ? 'bg-primary text-primary-foreground shadow-tactical'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background'
                  }`}
                >
                  <Icon name={tab?.icon} size={18} />
                  <span className="font-medium">{tab?.label}</span>
                </button>
              ))}
            </div>

            {/* Search and Filters */}
            {activeTab !== 'seasonal' && (
              <div className="mb-6">
                <SearchAndFilters
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  activeTab={activeTab}
                />
              </div>
            )}

            {/* Content */}
            <div className="space-y-6">
              {activeTab === 'collections' && (
                <div className="space-y-4">
                  {filteredCollections?.length > 0 ? (
                    filteredCollections?.map((category) => (
                      <CollectionCategory
                        key={category?.id}
                        category={category}
                        items={category?.items}
                        isExpanded={expandedCategories?.[category?.id]}
                        onToggle={() => toggleCategory(category?.id)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Icon name="Package" size={48} className="text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No collections found</h3>
                      <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'triumphs' && (
                <div className="space-y-4">
                  {filteredTriumphs?.length > 0 ? (
                    filteredTriumphs?.map((triumph) => (
                      <TriumphNode key={triumph?.id} triumph={triumph} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Icon name="Trophy" size={48} className="text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No triumphs found</h3>
                      <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'seasonal' && (
                <SeasonalProgress seasonData={seasonalData} />
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default CollectionsTriumphs;