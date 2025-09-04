import React from 'react';
import Icon from '../../../components/AppIcon';

const StatDisplay = ({ stats, targetStats, showTiers = true }) => {
  const statConfig = [
    { key: 'mobility', name: 'Mobility', icon: 'Zap', color: 'text-blue-400' },
    { key: 'resilience', name: 'Resilience', icon: 'Shield', color: 'text-green-400' },
    { key: 'recovery', name: 'Recovery', icon: 'Heart', color: 'text-red-400' },
    { key: 'discipline', name: 'Discipline', icon: 'Bomb', color: 'text-yellow-400' },
    { key: 'intellect', name: 'Intellect', icon: 'Brain', color: 'text-purple-400' },
    { key: 'strength', name: 'Strength', icon: 'Dumbbell', color: 'text-orange-400' }
  ];

  const getTier = (value) => Math.floor(value / 10);
  
  const getTierColor = (tier) => {
    if (tier >= 10) return 'text-accent';
    if (tier >= 8) return 'text-success';
    if (tier >= 6) return 'text-warning';
    if (tier >= 4) return 'text-secondary';
    return 'text-muted-foreground';
  };

  const getProgressColor = (value, target) => {
    const percentage = (value / 100) * 100;
    if (target && value >= target) return 'bg-success';
    if (percentage >= 80) return 'bg-accent';
    if (percentage >= 60) return 'bg-warning';
    if (percentage >= 40) return 'bg-secondary';
    return 'bg-muted';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-semibold text-foreground flex items-center">
          <Icon name="BarChart3" size={20} className="mr-2 text-primary" />
          Guardian Stats
        </h3>
        {showTiers && (
          <div className="text-sm text-muted-foreground">
            Total: <span className="text-foreground font-mono">{Object.values(stats)?.reduce((a, b) => a + b, 0)}</span>
          </div>
        )}
      </div>
      <div className="space-y-4">
        {statConfig?.map((stat) => {
          const value = stats?.[stat?.key] || 0;
          const target = targetStats?.[stat?.key];
          const tier = getTier(value);
          const progress = (value / 100) * 100;

          return (
            <div key={stat?.key} className="space-y-2">
              {/* Stat Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name={stat?.icon} size={16} className={stat?.color} />
                  <span className="text-sm font-medium text-foreground">{stat?.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono text-foreground">{value}</span>
                  {showTiers && (
                    <span className={`text-xs font-bold px-2 py-1 rounded ${getTierColor(tier)} bg-opacity-20`}>
                      T{tier}
                    </span>
                  )}
                  {target && (
                    <span className="text-xs text-muted-foreground">
                      / {target}
                    </span>
                  )}
                </div>
              </div>
              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(value, target)}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
                
                {/* Tier Markers */}
                {showTiers && (
                  <div className="absolute top-0 w-full h-2 flex">
                    {[...Array(10)]?.map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 border-r border-background last:border-r-0"
                        style={{ opacity: i * 10 <= value ? 0.3 : 0.1 }}
                      ></div>
                    ))}
                  </div>
                )}

                {/* Target Indicator */}
                {target && target <= 100 && (
                  <div
                    className="absolute top-0 w-0.5 h-2 bg-primary"
                    style={{ left: `${target}%` }}
                  ></div>
                )}
              </div>
              {/* Stat Details */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>
          );
        })}
      </div>
      {/* Stat Summary */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-muted-foreground">Total Tiers</div>
            <div className="text-lg font-bold text-foreground font-mono">
              {statConfig?.reduce((total, stat) => total + getTier(stats?.[stat?.key] || 0), 0)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">Wasted Stats</div>
            <div className="text-lg font-bold text-warning font-mono">
              {statConfig?.reduce((total, stat) => total + ((stats?.[stat?.key] || 0) % 10), 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatDisplay;