import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import LoadoutGrid from './components/LoadoutGrid';
import StatDisplay from './components/StatDisplay';
import BuildControls from './components/BuildControls';
import OptimizerPanel from './components/OptimizerPanel';
import InventoryPanel from './components/InventoryPanel';
import ModRecommendations from './components/ModRecommendations';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const LoadoutBuilderOptimizer = () => {
  const [selectedActivity, setSelectedActivity] = useState('pve');
  const [selectedBuild, setSelectedBuild] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showInventory, setShowInventory] = useState(false);
  const [showMods, setShowMods] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Mock builds data
  const mockBuilds = [
    {
      id: 'titan-pve-1',
      name: 'Titan PvE Tank',
      class: 'Titan',
      activity: 'PvE',
      loadout: {
        kinetic: {
          id: 'fatebringer',
          name: 'Fatebringer (Timelost)',
          type: 'Hand Cannon',
          powerLevel: 1810,
          icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
          stats: { impact: 84, range: 46, stability: 34 },
          optimizedFor: ['pve', 'raid']
        },
        energy: {
          id: 'ikelos-smg',
          name: 'IKELOS_SMG_v1.0.3',
          type: 'Submachine Gun',
          powerLevel: 1808,
          icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
          stats: { impact: 25, range: 32, stability: 54 },
          optimizedFor: ['pve']
        },
        power: {
          id: 'gjallarhorn',
          name: 'Gjallarhorn',
          type: 'Rocket Launcher',
          powerLevel: 1810,
          icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
          stats: { impact: 95, range: 50, stability: 27 },
          optimizedFor: ['pve', 'raid']
        },
        helmet: {
          id: 'helm-saint14',
          name: 'Helm of Saint-14',
          type: 'Helmet',
          powerLevel: 1810,
          icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
          stats: { mobility: 2, resilience: 20, recovery: 10, discipline: 6, intellect: 12, strength: 2 },
          optimizedFor: ['pve', 'raid']
        },
        gauntlets: {
          id: 'synthoceps',
          name: 'Synthoceps',
          type: 'Gauntlets',
          powerLevel: 1809,
          icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
          stats: { mobility: 6, resilience: 12, recovery: 6, discipline: 2, intellect: 2, strength: 20 },
          optimizedFor: ['pve']
        }
      },
      stats: { mobility: 50, resilience: 100, recovery: 80, discipline: 60, intellect: 70, strength: 40 }
    }
  ];

  const [currentLoadout, setCurrentLoadout] = useState(mockBuilds?.[0]?.loadout);
  const [currentStats, setCurrentStats] = useState(mockBuilds?.[0]?.stats);
  const [targetStats, setTargetStats] = useState({
    mobility: 50,
    resilience: 100,
    recovery: 80,
    discipline: 60,
    intellect: 70,
    strength: 40
  });

  const [recommendations] = useState([
    {
      title: 'Swap to Higher Recovery Armor',
      description: 'Replace chest piece with higher recovery roll to reach T10',
      improvement: '15 Recovery',
      items: [
        { name: 'Phoenix Cradle', icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=50&h=50&fit=crop' }
      ]
    },
    {
      title: 'Add Powerful Friends Mod',
      description: 'Increase mobility to next tier breakpoint',
      improvement: '20 Mobility',
      items: [
        { name: 'Powerful Friends', icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=50&h=50&fit=crop' }
      ]
    }
  ]);

  useEffect(() => {
    if (selectedBuild) {
      const build = mockBuilds?.find(b => b?.id === selectedBuild);
      if (build) {
        setCurrentLoadout(build?.loadout);
        setCurrentStats(build?.stats);
      }
    }
  }, [selectedBuild]);

  const handleSlotClick = (slotId) => {
    setSelectedSlot(slotId);
    setShowInventory(true);
  };

  const handleItemSelect = (item) => {
    setCurrentLoadout(prev => ({
      ...prev,
      [selectedSlot]: item
    }));
    
    // Recalculate stats (simplified)
    const newStats = { ...currentStats };
    if (item?.stats) {
      Object.keys(item?.stats)?.forEach(stat => {
        if (newStats?.[stat] !== undefined) {
          newStats[stat] = Math.min(100, newStats?.[stat] + (item?.stats?.[stat] || 0));
        }
      });
    }
    setCurrentStats(newStats);
    setShowInventory(false);
    setSelectedSlot(null);
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsOptimizing(false);
  };

  const handleSaveBuild = (name) => {
    console.log('Saving build:', name);
    // Implementation would save to backend/localStorage
  };

  const handleShareBuild = () => {
    const buildUrl = `${window.location?.origin}/loadout-builder-optimizer?build=${selectedBuild || 'current'}`;
    navigator.clipboard?.writeText(buildUrl);
    // Show toast notification
  };

  const handleImportBuild = (buildData) => {
    console.log('Importing build:', buildData);
    // Implementation would parse build data
  };

  const handleModSelect = (mod) => {
    console.log('Selected mod:', mod);
    // Implementation would add mod to current build
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="container mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
                  Loadout Builder & Optimizer
                </h1>
                <p className="text-muted-foreground">
                  Create, optimize, and share complete equipment builds for any activity
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  iconName="Package"
                  iconPosition="left"
                  onClick={() => setShowInventory(!showInventory)}
                >
                  Inventory
                </Button>
                <Button
                  variant="outline"
                  iconName="Zap"
                  iconPosition="left"
                  onClick={() => setShowMods(!showMods)}
                >
                  Mods
                </Button>
              </div>
            </div>
          </div>

          {/* Build Controls */}
          <div className="mb-8">
            <BuildControls
              selectedBuild={selectedBuild}
              onBuildSelect={setSelectedBuild}
              onSaveBuild={handleSaveBuild}
              onShareBuild={handleShareBuild}
              onImportBuild={handleImportBuild}
              selectedActivity={selectedActivity}
              onActivityChange={setSelectedActivity}
              builds={mockBuilds}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-8">
              {/* Loadout Grid */}
              <LoadoutGrid
                loadout={currentLoadout}
                onSlotClick={handleSlotClick}
                selectedActivity={selectedActivity}
              />

              {/* Stats Display */}
              <StatDisplay
                stats={currentStats}
                targetStats={targetStats}
                showTiers={true}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Optimizer Panel */}
              <OptimizerPanel
                targetStats={targetStats}
                onTargetStatsChange={setTargetStats}
                onOptimize={handleOptimize}
                isOptimizing={isOptimizing}
                recommendations={recommendations}
              />
            </div>
          </div>

          {/* Inventory Panel Modal */}
          {showInventory && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h2 className="text-xl font-heading font-semibold text-foreground">
                    Select Item for {selectedSlot}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowInventory(false);
                      setSelectedSlot(null);
                    }}
                  >
                    <Icon name="X" size={20} />
                  </Button>
                </div>
                <div className="p-6 overflow-y-auto">
                  <InventoryPanel
                    onItemSelect={handleItemSelect}
                    selectedSlot={selectedSlot}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mod Recommendations Modal */}
          {showMods && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h2 className="text-xl font-heading font-semibold text-foreground">
                    Mod Recommendations
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMods(false)}
                  >
                    <Icon name="X" size={20} />
                  </Button>
                </div>
                <div className="p-6 overflow-y-auto">
                  <ModRecommendations
                    selectedActivity={selectedActivity}
                    currentLoadout={currentLoadout}
                    onModSelect={handleModSelect}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LoadoutBuilderOptimizer;