import React from 'react';
import Icon from '../../../components/AppIcon';


const ActivityFeed = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'raid_completion': return 'Crown';
      case 'exotic_drop': return 'Star';
      case 'triumph': return 'Trophy';
      case 'clan_activity': return 'Users';
      case 'pvp_match': return 'Swords';
      case 'nightfall': return 'Zap';
      default: return 'Activity';
    }
  };

  const getActivityColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'raid_completion': return 'text-purple-400';
      case 'exotic_drop': return 'text-warning';
      case 'triumph': return 'text-success';
      case 'clan_activity': return 'text-blue-400';
      case 'pvp_match': return 'text-red-400';
      case 'nightfall': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Activity
          </h2>
          <button className="text-sm text-primary hover:text-primary/80 transition-colors">
            View All
          </button>
        </div>
      </div>
      {/* Activity List */}
      <div className="divide-y divide-border">
        {activities?.map((activity) => (
          <div key={activity?.id} className="p-4 hover:bg-muted/30 transition-colors">
            <div className="flex items-start space-x-3">
              {/* Activity Icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-muted/50 ${getActivityColor(activity?.type)}`}>
                <Icon 
                  name={getActivityIcon(activity?.type)} 
                  size={16} 
                />
              </div>

              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{activity?.playerName}</span>
                      {' '}
                      <span className="text-muted-foreground">{activity?.description}</span>
                    </p>
                    
                    {/* Activity Details */}
                    {activity?.details && (
                      <div className="mt-1 flex items-center space-x-2">
                        {activity?.details?.item && (
                          <div className="flex items-center space-x-1">
                            <div className="w-4 h-4 bg-warning/20 rounded border border-warning/30 flex items-center justify-center">
                              <Icon name="Star" size={10} className="text-warning" />
                            </div>
                            <span className="text-xs text-foreground font-medium">
                              {activity?.details?.item}
                            </span>
                          </div>
                        )}
                        
                        {activity?.details?.location && (
                          <span className="text-xs text-muted-foreground">
                            in {activity?.details?.location}
                          </span>
                        )}
                        
                        {activity?.details?.score && (
                          <span className="text-xs text-primary font-mono">
                            {activity?.details?.score} pts
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Timestamp */}
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {formatTimeAgo(activity?.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Load More */}
      <div className="p-4 border-t border-border">
        <button className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center space-x-1">
          <Icon name="RotateCcw" size={14} />
          <span>Load More Activities</span>
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;