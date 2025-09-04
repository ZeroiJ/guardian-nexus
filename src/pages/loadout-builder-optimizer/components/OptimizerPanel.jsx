import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const OptimizerPanel = ({ 
  targetStats, 
  onTargetStatsChange, 
  onOptimize, 
  isOptimizing,
  recommendations = []
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [optimizationSettings, setOptimizationSettings] = useState({
    prioritizeExotics: true,
    allowMasterwork: true,
    includeSeasonalMods: true,
    maxCost: 10
  });

  const statConfig = [
    { key: 'mobility', name: 'Mobility', icon: 'Zap', color: 'text-blue-400' },
    { key: 'resilience', name: 'Resilience', icon: 'Shield', color: 'text-green-400' },
    { key: 'recovery', name: 'Recovery', icon: 'Heart', color: 'text-red-400' },
    { key: 'discipline', name: 'Discipline', icon: 'Bomb', color: 'text-yellow-400' },
    { key: 'intellect', name: 'Intellect', icon: 'Brain', color: 'text-purple-400' },
    { key: 'strength', name: 'Strength', icon: 'Dumbbell', color: 'text-orange-400' }
  ];

  const handleStatChange = (stat, value) => {
    onTargetStatsChange({
      ...targetStats,
      [stat]: parseInt(value)
    });
  };

  const handlePresetSelect = (preset) => {
    const presets = {
      pvp: { mobility: 100, resilience: 100, recovery: 60, discipline: 60, intellect: 40, strength: 40 },
      pve: { mobility: 50, resilience: 100, recovery: 100, discipline: 80, intellect: 60, strength: 40 },
      raid: { mobility: 40, resilience: 100, recovery: 100, discipline: 100, intellect: 80, strength: 40 }
    };
    
    onTargetStatsChange(presets?.[preset] || {});
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-semibold text-foreground flex items-center">
          <Icon name="Target" size={20} className="mr-2 text-primary" />
          Optimizer
        </h3>
        <Button
          variant="ghost"
          size="sm"
          iconName={showAdvanced ? 'ChevronUp' : 'ChevronDown'}
          iconPosition="right"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          Advanced
        </Button>
      </div>
      {/* Stat Targets */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Target Stats</span>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="xs"
              onClick={() => handlePresetSelect('pvp')}
            >
              PvP
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => handlePresetSelect('pve')}
            >
              PvE
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => handlePresetSelect('raid')}
            >
              Raid
            </Button>
          </div>
        </div>

        {statConfig?.map((stat) => (
          <div key={stat?.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name={stat?.icon} size={14} className={stat?.color} />
                <span className="text-sm text-foreground">{stat?.name}</span>
              </div>
              <span className="text-sm font-mono text-foreground">
                {targetStats?.[stat?.key] || 0}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={targetStats?.[stat?.key] || 0}
              onChange={(e) => handleStatChange(stat?.key, e?.target?.value)}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        ))}
      </div>
      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="space-y-4 mb-6 p-4 bg-muted/20 rounded-lg">
          <h4 className="text-sm font-medium text-foreground">Optimization Settings</h4>
          
          <div className="space-y-3">
            <Checkbox
              label="Prioritize Exotic Armor"
              description="Include exotic armor pieces in optimization"
              checked={optimizationSettings?.prioritizeExotics}
              onChange={(e) => setOptimizationSettings(prev => ({
                ...prev,
                prioritizeExotics: e?.target?.checked
              }))}
            />

            <Checkbox
              label="Allow Masterwork Upgrades"
              description="Consider masterworked armor (+2 to all stats)"
              checked={optimizationSettings?.allowMasterwork}
              onChange={(e) => setOptimizationSettings(prev => ({
                ...prev,
                allowMasterwork: e?.target?.checked
              }))}
            />

            <Checkbox
              label="Include Seasonal Mods"
              description="Use current season's armor mods"
              checked={optimizationSettings?.includeSeasonalMods}
              onChange={(e) => setOptimizationSettings(prev => ({
                ...prev,
                includeSeasonalMods: e?.target?.checked
              }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Max Energy Cost: {optimizationSettings?.maxCost}
            </label>
            <input
              type="range"
              min="5"
              max="10"
              value={optimizationSettings?.maxCost}
              onChange={(e) => setOptimizationSettings(prev => ({
                ...prev,
                maxCost: parseInt(e?.target?.value)
              }))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}
      {/* Optimize Button */}
      <Button
        onClick={onOptimize}
        loading={isOptimizing}
        iconName="Zap"
        iconPosition="left"
        fullWidth
        className="mb-6"
      >
        {isOptimizing ? 'Optimizing...' : 'Optimize Build'}
      </Button>
      {/* Recommendations */}
      {recommendations?.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground flex items-center">
            <Icon name="Lightbulb" size={16} className="mr-2 text-warning" />
            Recommendations
          </h4>
          
          <div className="space-y-2">
            {recommendations?.slice(0, 3)?.map((rec, index) => (
              <div
                key={index}
                className="p-3 bg-muted/20 rounded-lg border border-border"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{rec?.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{rec?.description}</div>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <Icon name="TrendingUp" size={14} className="text-success" />
                    <span className="text-xs text-success font-mono">+{rec?.improvement}</span>
                  </div>
                </div>
                
                {rec?.items && (
                  <div className="flex items-center space-x-2 mt-2">
                    {rec?.items?.slice(0, 3)?.map((item, itemIndex) => (
                      <div key={itemIndex} className="w-6 h-6 bg-muted rounded overflow-hidden">
                        <img
                          src={item?.icon}
                          alt={item?.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/assets/images/no_image.png';
                          }}
                        />
                      </div>
                    ))}
                    {rec?.items?.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{rec?.items?.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizerPanel;