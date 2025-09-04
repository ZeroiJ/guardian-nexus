import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const SeasonalProgress = ({ seasonData }) => {
  const { currentSeason, seasonPass, artifact, timeRemaining } = seasonData;
  
  const formatTimeRemaining = (hours) => {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Season Header */}
      <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Image
                src={currentSeason?.icon}
                alt={currentSeason?.name}
                className="w-12 h-12 object-cover rounded"
              />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold text-foreground">{currentSeason?.name}</h2>
              <p className="text-muted-foreground">{currentSeason?.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-warning">
              <Icon name="Clock" size={16} />
              <span className="text-sm font-mono">{formatTimeRemaining(timeRemaining)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Season ends</p>
          </div>
        </div>
      </div>
      {/* Season Pass Progress */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-heading font-bold text-foreground">Season Pass</h3>
          <div className="flex items-center space-x-2">
            <Icon name="Star" size={16} className="text-accent" />
            <span className="text-sm font-mono text-accent">Level {seasonPass?.currentLevel}</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* XP Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Current XP</span>
              <span className="font-mono text-foreground">
                {seasonPass?.currentXP?.toLocaleString()} / {seasonPass?.nextLevelXP?.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${(seasonPass?.currentXP / seasonPass?.nextLevelXP) * 100}%` }}
              />
            </div>
          </div>

          {/* Recent Rewards */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Recent Rewards</h4>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {seasonPass?.recentRewards?.map((reward, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-muted rounded border border-border overflow-hidden">
                    <Image
                      src={reward?.icon}
                      alt={reward?.name}
                      className="w-full h-full object-cover"
                    />
                    {reward?.isPremium && (
                      <div className="absolute top-1 right-1 w-3 h-3 bg-accent rounded-full" />
                    )}
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover border border-border rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                    {reward?.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Artifact Progress */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-heading font-bold text-foreground">Seasonal Artifact</h3>
          <div className="flex items-center space-x-2">
            <Icon name="Zap" size={16} className="text-warning" />
            <span className="text-sm font-mono text-warning">+{artifact?.powerBonus}</span>
          </div>
        </div>

        <div className="space-y-4">
          {artifact?.mods?.map((modCategory, categoryIndex) => (
            <div key={categoryIndex}>
              <h4 className="text-sm font-medium text-foreground mb-2">{modCategory?.name}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {modCategory?.mods?.map((mod, modIndex) => (
                  <div
                    key={modIndex}
                    className={`relative p-2 rounded border transition-tactical ${
                      mod?.unlocked
                        ? 'bg-primary/10 border-primary/30' :'bg-muted border-border opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-muted rounded overflow-hidden">
                        <Image
                          src={mod?.icon}
                          alt={mod?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{mod?.name}</p>
                        <p className="text-xs text-muted-foreground">Cost: {mod?.cost}</p>
                      </div>
                    </div>
                    {mod?.unlocked && (
                      <div className="absolute top-1 right-1 w-3 h-3 bg-success rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Weekly Challenges */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-heading font-bold text-foreground mb-4">Weekly Challenges</h3>
        <div className="space-y-3">
          {seasonData?.weeklyChallenges?.map((challenge, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  challenge?.completed ? 'bg-success' : 'bg-muted-foreground'
                }`} />
                <div>
                  <p className="text-sm font-medium text-foreground">{challenge?.name}</p>
                  <p className="text-xs text-muted-foreground">{challenge?.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <Icon name="Star" size={14} className="text-accent" />
                  <span className="text-sm font-mono text-accent">+{challenge?.xpReward}</span>
                </div>
                {challenge?.progress !== undefined && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {challenge?.progress}/{challenge?.total}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeasonalProgress;