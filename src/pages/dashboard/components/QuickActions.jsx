import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const QuickActions = ({ onTransferItems, onVaultAccess, onLoadoutSwitch }) => {
  const quickActionButtons = [
    {
      id: 'transfer',
      label: 'Transfer Items',
      icon: 'ArrowRightLeft',
      description: 'Move items between characters',
      onClick: onTransferItems,
      variant: 'default'
    },
    {
      id: 'vault',
      label: 'Vault Access',
      icon: 'Archive',
      description: 'Access your vault storage',
      onClick: onVaultAccess,
      variant: 'outline'
    },
    {
      id: 'loadout',
      label: 'Switch Loadout',
      icon: 'Settings',
      description: 'Change equipment setup',
      onClick: onLoadoutSwitch,
      variant: 'secondary'
    }
  ];

  const notificationItems = [
    {
      id: 'postmaster',
      type: 'warning',
      icon: 'Mail',
      title: 'Postmaster Full',
      description: 'Hunter has 20/21 items',
      action: 'Clear Now'
    },
    {
      id: 'vendor_reset',
      type: 'info',
      icon: 'Clock',
      title: 'Vendor Reset',
      description: 'Xur arrives in 2h 15m',
      action: 'Set Reminder'
    },
    {
      id: 'clan_invite',
      type: 'success',
      icon: 'Users',
      title: 'Clan Invitation',
      description: 'New member request',
      action: 'Review'
    }
  ];

  const getNotificationColor = (type) => {
    switch (type) {
      case 'warning': return 'text-warning border-warning/30 bg-warning/10';
      case 'error': return 'text-error border-error/30 bg-error/10';
      case 'success': return 'text-success border-success/30 bg-success/10';
      case 'info': return 'text-primary border-primary/30 bg-primary/10';
      default: return 'text-muted-foreground border-border bg-muted/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActionButtons?.map((action) => (
            <div key={action?.id} className="space-y-2">
              <Button
                variant={action?.variant}
                onClick={action?.onClick}
                iconName={action?.icon}
                iconPosition="left"
                fullWidth
                className="h-12"
              >
                {action?.label}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                {action?.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Notifications */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Notifications
            </h2>
            <button className="text-sm text-primary hover:text-primary/80 transition-colors">
              Mark All Read
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-border">
          {notificationItems?.map((notification) => (
            <div key={notification?.id} className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${getNotificationColor(notification?.type)}`}>
                  <Icon 
                    name={notification?.icon} 
                    size={16} 
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-foreground">
                        {notification?.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification?.description}
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 text-xs"
                    >
                      {notification?.action}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            fullWidth
            iconName="Bell"
            iconPosition="left"
            size="sm"
          >
            View All Notifications
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;