import React from 'react';
import Icon from '../../../components/AppIcon';

const MilestoneCard = ({ milestone }) => {
  const getProgressPercentage = () => {
    return Math.min((milestone?.progress / milestone?.total) * 100, 100);
  };

  const getActivityIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'raid': return 'Crown';
      case 'nightfall': return 'Zap';
      case 'crucible': return 'Swords';
      case 'gambit': return 'Target';
      case 'seasonal': return 'Calendar';
      default: return 'Activity';
    }
  };

  const getResetTime = () => {
    const now = new Date();
    const resetDay = new Date(now);
    resetDay?.setUTCDate(now?.getUTCDate() + ((2 - now?.getUTCDay() + 7) % 7));
    resetDay?.setUTCHours(17, 0, 0, 0);
    
    const timeDiff = resetDay - now;
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover-scale transition-tactical">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            milestone?.completed ? 'bg-success/20 border border-success/30' : 'bg-muted'
          }`}>
            <Icon 
              name={getActivityIcon(milestone?.type)} 
              size={16} 
              className={milestone?.completed ? 'text-success' : 'text-muted-foreground'}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {milestone?.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {milestone?.type}
            </p>
          </div>
        </div>
        
        {milestone?.completed ? (
          <Icon name="CheckCircle" size={20} className="text-success" />
        ) : (
          <div className="text-xs text-muted-foreground text-right">
            <div>Resets in</div>
            <div className="font-mono">{getResetTime()}</div>
          </div>
        )}
      </div>
      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Progress</span>
          <span>{milestone?.progress}/{milestone?.total}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              milestone?.completed ? 'bg-success' : 'bg-primary'
            }`}
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>
      {/* Rewards */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Icon name="Gift" size={14} className="text-warning" />
          <span className="text-xs text-muted-foreground">
            {milestone?.rewards?.join(', ')}
          </span>
        </div>
        <div className="text-xs font-mono text-primary">
          +{milestone?.powerfulReward}
        </div>
      </div>
    </div>
  );
};

export default MilestoneCard;