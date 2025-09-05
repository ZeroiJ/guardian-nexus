import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import UserProfile from '../../components/ui/UserProfile';
import CharacterCard from './components/CharacterCard';
import MilestoneCard from './components/MilestoneCard';
import VendorCard from './components/VendorCard';
import ActivityFeed from './components/ActivityFeed';
import SeasonalProgress from './components/SeasonalProgress';
import QuickActions from './components/QuickActions';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const Dashboard = () => {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for characters
  const mockCharacters = [
    {
      id: 1,
      name: 'Guardian Alpha',
      class: 'Titan',
      powerLevel: 1810,
      emblem: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&h=200&fit=crop',
      equippedExotic: {
        name: 'Thundercrash',
        type: 'Chest Armor'
      },
      lastActivity: '2 hours ago'
    },
    {
      id: 2,
      name: 'Guardian Beta',
      class: 'Hunter',
      powerLevel: 1805,
      emblem: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop',
      equippedExotic: {
        name: 'Celestial Nighthawk',
        type: 'Helmet'
      },
      lastActivity: '1 day ago'
    },
    {
      id: 3,
      name: 'Guardian Gamma',
      class: 'Warlock',
      powerLevel: 1798,
      emblem: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
      equippedExotic: {
        name: 'Phoenix Protocol',
        type: 'Chest Armor'
      },
      lastActivity: '3 days ago'
    }
  ];

  // Mock data for milestones
  const mockMilestones = [
    {
      id: 1,
      name: 'Vow of the Disciple',
      type: 'Raid',
      progress: 4,
      total: 6,
      completed: false,
      rewards: ['Pinnacle Gear', 'Raid Weapons'],
      powerfulReward: '1810'
    },
    {
      id: 2,
      name: 'Grandmaster Nightfall',
      type: 'Nightfall',
      progress: 3,
      total: 3,
      completed: true,
      rewards: ['Adept Weapons', 'Ascendant Shards'],
      powerfulReward: '1810'
    },
    {
      id: 3,
      name: 'Crucible Playlist',
      type: 'Crucible',
      progress: 5,
      total: 8,
      completed: false,
      rewards: ['Powerful Gear'],
      powerfulReward: '1807'
    },
    {
      id: 4,
      name: 'Seasonal Challenges',
      type: 'Seasonal',
      progress: 12,
      total: 15,
      completed: false,
      rewards: ['Bright Dust', 'XP'],
      powerfulReward: '1805'
    }
  ];

  // Mock data for vendors
  const mockVendors = [
    {
      id: 1,
      name: 'Xur',
      location: 'Tower Hangar',
      image: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?w=100&h=100&fit=crop',
      resetTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      featuredItems: [
        {
          name: 'Gjallarhorn',
          type: 'Exotic Rocket Launcher',
          rarity: 'Exotic',
          cost: '29',
          icon: 'Rocket'
        },
        {
          name: 'Orpheus Rig',
          type: 'Hunter Leg Armor',
          rarity: 'Exotic',
          cost: '23',
          icon: 'Shield'
        }
      ]
    },
    {
      id: 2,
      name: 'Ada-1',
      location: 'Tower Annex',
      image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?w=100&h=100&fit=crop',
      resetTime: new Date(Date.now() + 18 * 60 * 60 * 1000),
      featuredItems: [
        {
          name: 'Protective Light',
          type: 'Combat Style Mod',
          rarity: 'Legendary',
          cost: '10',
          icon: 'Shield'
        },
        {
          name: 'Charged with Light',
          type: 'Combat Style Mod',
          rarity: 'Legendary',
          cost: '10',
          icon: 'Zap'
        }
      ]
    }
  ];

  // Mock data for activities
  const mockActivities = [
    {
      id: 1,
      type: 'exotic_drop',
      playerName: 'Guardian Alpha',
      description: 'obtained',
      details: {
        item: 'Vex Mythoclast',
        location: 'Vault of Glass'
      },
      timestamp: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: 2,
      type: 'raid_completion',
      playerName: 'ClanMate_42',
      description: 'completed',
      details: {
        location: 'King\'s Fall',
        score: '285,000'
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 3,
      type: 'triumph',
      playerName: 'Guardian Beta',
      description: 'unlocked triumph',
      details: {
        item: 'Flawless Raider'
      },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },
    {
      id: 4,
      type: 'clan_activity',
      playerName: 'ClanLeader_99',
      description: 'invited new member',
      details: {
        item: 'DestinyPlayer_123'
      },
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
    },
    {
      id: 5,
      type: 'pvp_match',
      playerName: 'Guardian Gamma',
      description: 'achieved',
      details: {
        item: 'We Ran Out of Medals',
        location: 'Trials of Osiris',
        score: '7-0'
      },
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000)
    }
  ];

  // Mock data for seasonal progress
  const mockSeasonData = {
    name: 'Season of the Witch',
    currentRank: 127,
    maxRank: 200,
    currentXP: 75000,
    nextLevelXP: 100000,
    daysRemaining: 45,
    availableRewards: 8,
    nextReward: {
      name: 'Exotic Engram',
      rank: 130
    },
    weeklyChallenges: {
      completed: 7,
      total: 10
    }
  };

  useEffect(() => {
    if (mockCharacters?.length > 0) {
      setSelectedCharacter(mockCharacters?.[0]);
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleTransferItems = () => {
    console.log('Transfer items clicked');
  };

  const handleVaultAccess = () => {
    console.log('Vault access clicked');
  };

  const handleLoadoutSwitch = () => {
    console.log('Loadout switch clicked');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Welcome back, Guardian
                </h1>
                <p className="text-muted-foreground">
                  Your Destiny 2 overview and quick access to game features
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  loading={refreshing}
                  iconName="RotateCcw"
                  iconPosition="left"
                >
                  Refresh Data
                </Button>
              </div>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="mb-8">
            <UserProfile className="w-full" />
          </div>

          {/* Dashboard Actions */}
          <div className="mb-8">
            <div className="flex items-center space-x-4">
              <Link to="/character-management">
                <Button
                  variant="default"
                  iconName="Users"
                  iconPosition="left"
                >
                  Manage Characters
                </Button>
              </Link>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Characters & Milestones */}
            <div className="lg:col-span-8 space-y-6">
              {/* Characters Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">
                    Your Characters
                  </h2>
                  <Link 
                    to="/character-management"
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mockCharacters?.map((character) => (
                    <CharacterCard
                      key={character?.id}
                      character={character}
                      isActive={selectedCharacter?.id === character?.id}
                      onClick={setSelectedCharacter}
                    />
                  ))}
                </div>
              </div>

              {/* Weekly Milestones */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">
                    Weekly Milestones
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    Resets in 2d 14h
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockMilestones?.map((milestone) => (
                    <MilestoneCard
                      key={milestone?.id}
                      milestone={milestone}
                    />
                  ))}
                </div>
              </div>

              {/* Vendor Rotation */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">
                    Vendor Rotation
                  </h2>
                  <Link 
                    to="/weapon-armor-database"
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    View All Vendors
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockVendors?.map((vendor) => (
                    <VendorCard
                      key={vendor?.id}
                      vendor={vendor}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Activity Feed & Quick Actions */}
            <div className="lg:col-span-4 space-y-6">
              {/* Seasonal Progress */}
              <SeasonalProgress seasonData={mockSeasonData} />

              {/* Quick Actions */}
              <QuickActions
                onTransferItems={handleTransferItems}
                onVaultAccess={handleVaultAccess}
                onLoadoutSwitch={handleLoadoutSwitch}
              />

              {/* Activity Feed */}
              <ActivityFeed activities={mockActivities} />
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="mt-8 bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Quick Navigation
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/weapon-armor-database"
                className="flex flex-col items-center p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <Icon name="Database" size={24} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-foreground">Database</span>
                <span className="text-xs text-muted-foreground text-center">Weapons & Armor</span>
              </Link>
              
              <Link
                to="/loadout-builder-optimizer"
                className="flex flex-col items-center p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <Icon name="Settings" size={24} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-foreground">Builder</span>
                <span className="text-xs text-muted-foreground text-center">Loadout Optimizer</span>
              </Link>
              
              <Link
                to="/collections-triumphs"
                className="flex flex-col items-center p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <Icon name="Trophy" size={24} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-foreground">Collections</span>
                <span className="text-xs text-muted-foreground text-center">Triumphs</span>
              </Link>
              
              <Link
                to="/character-management"
                className="flex flex-col items-center p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <Icon name="Users" size={24} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-foreground">Characters</span>
                <span className="text-xs text-muted-foreground text-center">Management</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;