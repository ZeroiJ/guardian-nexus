import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TriumphNode = ({ triumph }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const progressPercentage = Math.round((triumph?.progress / triumph?.total) * 100);
  const isCompleted = triumph?.progress >= triumph?.total;

  const getStatusIcon = () => {
    if (isCompleted) return 'CheckCircle';
    if (triumph?.progress > 0) return 'Clock';
    return 'Circle';
  };

  const getStatusColor = () => {
    if (isCompleted) return 'text-success';
    if (triumph?.progress > 0) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted transition-tactical"
      >
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden">
              <Image
                src={triumph?.icon}
                alt={triumph?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-background rounded-full flex items-center justify-center border border-border">
              <Icon 
                name={getStatusIcon()} 
                size={14} 
                className={getStatusColor()} 
              />
            </div>
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-base font-heading font-bold text-foreground">{triumph?.name}</h3>
            <p className="text-sm text-muted-foreground">{triumph?.description}</p>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-muted rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-success' : 'bg-primary'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {triumph?.progress}/{triumph?.total}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="Trophy" size={12} className="text-accent" />
                <span className="text-xs font-mono text-accent">{triumph?.points}</span>
              </div>
            </div>
          </div>
        </div>
        <Icon 
          name={isExpanded ? 'ChevronUp' : 'ChevronDown'} 
          size={20} 
          className="text-muted-foreground" 
        />
      </button>
      {isExpanded && (
        <div className="border-t border-border p-4">
          <div className="space-y-4">
            {triumph?.objectives && triumph?.objectives?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Objectives:</h4>
                <div className="space-y-2">
                  {triumph?.objectives?.map((objective, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <span className="text-sm text-foreground">{objective?.description}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono text-muted-foreground">
                          {objective?.progress}/{objective?.total}
                        </span>
                        {objective?.progress >= objective?.total && (
                          <Icon name="Check" size={14} className="text-success" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {triumph?.rewards && triumph?.rewards?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Rewards:</h4>
                <div className="flex flex-wrap gap-2">
                  {triumph?.rewards?.map((reward, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-muted rounded-md px-3 py-1">
                      <Icon name="Gift" size={14} className="text-accent" />
                      <span className="text-sm text-foreground">{reward}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {triumph?.lore && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Lore:</h4>
                <p className="text-sm text-muted-foreground italic">{triumph?.lore}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Completion Rate: {triumph?.completionRate}%</span>
              <span>Category: {triumph?.category}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TriumphNode;