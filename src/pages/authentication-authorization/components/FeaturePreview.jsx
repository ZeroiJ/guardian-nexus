import React from 'react';
import Icon from '../../../components/AppIcon';

const FeaturePreview = () => {
  const features = [
    {
      icon: 'User',
      title: 'Character Management',
      description: 'View all your Guardians with real-time stats, equipment, and power levels across all platforms.'
    },
    {
      icon: 'Database',
      title: 'Complete Item Database',
      description: 'Access detailed information on every weapon, armor piece, and exotic in Destiny 2 with god roll recommendations.'
    },
    {
      icon: 'Settings',
      title: 'Loadout Optimizer',
      description: 'Build and optimize loadouts for any activity with our advanced stat distribution calculator.'
    },
    {
      icon: 'Trophy',
      title: 'Progress Tracking',
      description: 'Monitor triumphs, collections, seasonal progress, and milestone completion across all characters.'
    },
    {
      icon: 'BarChart3',
      title: 'Performance Analytics',
      description: 'Detailed PvP and PvE statistics with match history and performance trends over time.'
    },
    {
      icon: 'Users',
      title: 'Clan Management',
      description: 'Manage your clan members, track activity, and coordinate raids with integrated scheduling tools.'
    }
  ];

  return (
    <div className="hidden xl:block w-full max-w-lg">
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center">
          <Icon name="Sparkles" size={24} className="mr-3 text-primary" />
          What You'll Get Access To
        </h3>
        <div className="space-y-6">
          {features?.map((feature, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name={feature?.icon} size={20} color="white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-foreground mb-1">{feature?.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature?.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Additional Benefits */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-success">
              <Icon name="Check" size={16} className="mr-1" />
              <span>Free Forever</span>
            </div>
            <div className="flex items-center text-success">
              <Icon name="Shield" size={16} className="mr-1" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center text-success">
              <Icon name="Zap" size={16} className="mr-1" />
              <span>Real-time Sync</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturePreview;