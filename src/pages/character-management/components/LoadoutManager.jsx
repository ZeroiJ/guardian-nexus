import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const LoadoutManager = ({ loadouts, onLoadoutSelect, onLoadoutSave, onLoadoutDelete, onLoadoutApply }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newLoadoutName, setNewLoadoutName] = useState('');
  const [selectedLoadout, setSelectedLoadout] = useState(null);

  const activityTypes = {
    'raid': { name: 'Raid', icon: 'Users', color: 'text-destructive' },
    'pvp': { name: 'PvP', icon: 'Sword', color: 'text-warning' },
    'pve': { name: 'PvE', icon: 'Target', color: 'text-success' },
    'gambit': { name: 'Gambit', icon: 'Zap', color: 'text-accent' },
    'general': { name: 'General', icon: 'Star', color: 'text-primary' }
  };

  const handleCreateLoadout = () => {
    if (newLoadoutName?.trim()) {
      onLoadoutSave && onLoadoutSave({
        name: newLoadoutName,
        activityType: 'general',
        description: `Custom loadout created on ${new Date()?.toLocaleDateString()}`
      });
      setNewLoadoutName('');
      setIsCreating(false);
    }
  };

  const handleLoadoutClick = (loadout) => {
    setSelectedLoadout(selectedLoadout?.id === loadout?.id ? null : loadout);
    onLoadoutSelect && onLoadoutSelect(loadout);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-heading font-bold text-foreground">Loadouts</h2>
        <Button
          variant="default"
          size="sm"
          iconName="Plus"
          iconPosition="left"
          onClick={() => setIsCreating(true)}
        >
          Create Loadout
        </Button>
      </div>
      {/* Create New Loadout */}
      {isCreating && (
        <div className="bg-muted rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <Input
              type="text"
              placeholder="Enter loadout name..."
              value={newLoadoutName}
              onChange={(e) => setNewLoadoutName(e?.target?.value)}
              className="flex-1"
            />
            <Button
              variant="default"
              size="sm"
              onClick={handleCreateLoadout}
              disabled={!newLoadoutName?.trim()}
            >
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsCreating(false);
                setNewLoadoutName('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      {/* Loadout List */}
      <div className="space-y-4">
        {loadouts?.map((loadout) => {
          const activity = activityTypes?.[loadout?.activityType] || activityTypes?.general;
          const isSelected = selectedLoadout?.id === loadout?.id;

          return (
            <div
              key={loadout?.id}
              onClick={() => handleLoadoutClick(loadout)}
              className={`p-4 rounded-lg border cursor-pointer transition-tactical hover-scale ${
                isSelected
                  ? 'border-primary bg-primary/10 shadow-tactical'
                  : 'border-border bg-muted hover:border-primary/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`flex items-center space-x-2 ${activity?.color}`}>
                      <Icon name={activity?.icon} size={16} />
                      <span className="text-sm font-medium">{activity?.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">•</div>
                    <div className="text-sm text-muted-foreground">{loadout?.lastUsed}</div>
                  </div>
                  
                  <h3 className="text-lg font-heading font-bold text-foreground mb-1">
                    {loadout?.name}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {loadout?.description}
                  </p>

                  {/* Equipment Preview */}
                  <div className="flex items-center space-x-2 mb-3">
                    {loadout?.equipment?.slice(0, 6)?.map((item, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded bg-background border border-border flex items-center justify-center overflow-hidden"
                      >
                        <Image
                          src={item?.icon}
                          alt={item?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {loadout?.equipment?.length > 6 && (
                      <div className="w-8 h-8 rounded bg-muted border border-border flex items-center justify-center">
                        <span className="text-xs font-mono text-muted-foreground">
                          +{loadout?.equipment?.length - 6}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Stats Summary */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm font-mono text-primary">{loadout?.stats?.mobility}</div>
                      <div className="text-xs text-muted-foreground">MOB</div>
                    </div>
                    <div>
                      <div className="text-sm font-mono text-primary">{loadout?.stats?.resilience}</div>
                      <div className="text-xs text-muted-foreground">RES</div>
                    </div>
                    <div>
                      <div className="text-sm font-mono text-primary">{loadout?.stats?.recovery}</div>
                      <div className="text-xs text-muted-foreground">REC</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  <Button
                    variant="default"
                    size="sm"
                    iconName="Zap"
                    onClick={(e) => {
                      e?.stopPropagation();
                      onLoadoutApply && onLoadoutApply(loadout);
                    }}
                  >
                    Apply
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Copy"
                    onClick={(e) => {
                      e?.stopPropagation();
                      // Handle duplicate loadout
                    }}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="Trash2"
                    onClick={(e) => {
                      e?.stopPropagation();
                      onLoadoutDelete && onLoadoutDelete(loadout?.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              {/* Expanded Details */}
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Weapons</h4>
                      <div className="space-y-2">
                        {loadout?.equipment?.filter(item => item?.category === 'weapons')?.map((weapon, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <div className="w-6 h-6 rounded bg-background border border-border flex items-center justify-center overflow-hidden">
                              <Image
                                src={weapon?.icon}
                                alt={weapon?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-foreground">{weapon?.name}</span>
                            <span className="text-muted-foreground">({weapon?.powerLevel})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Armor</h4>
                      <div className="space-y-2">
                        {loadout?.equipment?.filter(item => item?.category === 'armor')?.map((armor, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <div className="w-6 h-6 rounded bg-background border border-border flex items-center justify-center overflow-hidden">
                              <Image
                                src={armor?.icon}
                                alt={armor?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-foreground">{armor?.name}</span>
                            <span className="text-muted-foreground">({armor?.powerLevel})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {loadouts?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Star" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
          <div className="text-lg font-medium text-muted-foreground mb-2">No loadouts saved</div>
          <div className="text-sm text-muted-foreground mb-4">
            Create your first loadout to quickly switch between gear setups
          </div>
          <Button
            variant="default"
            iconName="Plus"
            iconPosition="left"
            onClick={() => setIsCreating(true)}
          >
            Create Your First Loadout
          </Button>
        </div>
      )}
    </div>
  );
};

export default LoadoutManager;