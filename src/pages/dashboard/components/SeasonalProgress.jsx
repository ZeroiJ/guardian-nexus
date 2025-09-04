import React from 'react';
import Icon from '../../../components/AppIcon';

const SeasonalProgress = ({ seasonData }) => {
  const getProgressPercentage = () => {
    return Math.min((seasonData?.currentXP / seasonData?.nextLevelXP) * 100, 100);
  };

  const getSeasonProgressPercentage = () => {
    return Math.min((seasonData?.currentRank / seasonData?.maxRank) * 100, 100);
  };

  const formatXP = (xp) => {
    if (xp >= 1000000) return `${(xp / 1000000)?.toFixed(1)}M`;
    if (xp >= 1000) return `${(xp / 1000)?.toFixed(1)}K`;
    return xp?.toString();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      {/* Season Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <Icon name="Calendar" size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {seasonData?.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              Rank {seasonData?.currentRank} • {seasonData?.daysRemaining} days left
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-mono text-primary">
            {seasonData?.currentRank}/{seasonData?.maxRank}
          </div>
          <div className="text-xs text-muted-foreground">
            Season Rank
          </div>
        </div>
      </div>
      {/* Current Level Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">
            Level Progress
          </span>
          <span className="text-sm text-muted-foreground">
            {formatXP(seasonData?.currentXP)} / {formatXP(seasonData?.nextLevelXP)} XP
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div
            className="h-3 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>
      {/* Season Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">
            Season Progress
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(getSeasonProgressPercentage())}% Complete
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="h-2 bg-success rounded-full transition-all duration-300"
            style={{ width: `${getSeasonProgressPercentage()}%` }}
          ></div>
        </div>
      </div>
      {/* Available Rewards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            Available Rewards
          </span>
          <span className="text-sm text-primary">
            {seasonData?.availableRewards} unclaimed
          </span>
        </div>
        
        {/* Reward Preview */}
        <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
          <div className="w-8 h-8 bg-warning/20 rounded border border-warning/30 flex items-center justify-center">
            <Icon name="Gift" size={16} className="text-warning" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-foreground">
              {seasonData?.nextReward?.name}
            </div>
            <div className="text-xs text-muted-foreground">
              Rank {seasonData?.nextReward?.rank}
            </div>
          </div>
          <button className="text-xs text-primary hover:text-primary/80 transition-colors px-2 py-1 bg-primary/10 rounded">
            Claim
          </button>
        </div>
      </div>
      {/* Weekly Challenges */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Weekly Challenges
          </span>
          <span className="text-xs text-muted-foreground">
            {seasonData?.weeklyChallenges?.completed}/{seasonData?.weeklyChallenges?.total}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="h-2 bg-accent rounded-full transition-all duration-300"
            style={{ 
              width: `${(seasonData?.weeklyChallenges?.completed / seasonData?.weeklyChallenges?.total) * 100}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SeasonalProgress;