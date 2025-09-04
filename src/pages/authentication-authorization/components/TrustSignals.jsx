import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustSignals = () => {
  const trustMetrics = [
    { label: 'Active Users', value: '2.5M+', icon: 'Users' },
    { label: 'Uptime', value: '99.9%', icon: 'Activity' },
    { label: 'API Calls', value: '1B+', icon: 'Database' },
    { label: 'Years Active', value: '5+', icon: 'Calendar' }
  ];

  const endorsements = [
    {
      text: "Essential tool for any serious Guardian. The loadout optimizer saved me hours of min-maxing.",
      author: "DestinyStreamer",
      role: "Content Creator",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    },
    {
      text: "Best companion app for Destiny 2. Clean interface and lightning-fast data sync.",
      author: "RaidLeader_Pro",
      role: "Clan Leader",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
    }
  ];

  return (
    <div className="hidden lg:block w-full max-w-md">
      {/* Trust Metrics */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Shield" size={20} className="mr-2 text-primary" />
          Trusted by Guardians
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {trustMetrics?.map((metric, index) => (
            <div key={index} className="text-center">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Icon name={metric?.icon} size={20} className="text-primary" />
              </div>
              <div className="text-xl font-bold text-foreground">{metric?.value}</div>
              <div className="text-xs text-muted-foreground">{metric?.label}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Community Endorsements */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="MessageSquare" size={20} className="mr-2 text-primary" />
          Community Love
        </h3>
        <div className="space-y-4">
          {endorsements?.map((endorsement, index) => (
            <div key={index} className="border-l-2 border-primary/20 pl-4">
              <p className="text-sm text-muted-foreground mb-2">"{endorsement?.text}"</p>
              <div className="flex items-center">
                <img
                  src={endorsement?.avatar}
                  alt={endorsement?.author}
                  className="w-6 h-6 rounded-full mr-2"
                  onError={(e) => {
                    e.target.src = '/assets/images/no_image.png';
                  }}
                />
                <div>
                  <div className="text-xs font-medium text-foreground">{endorsement?.author}</div>
                  <div className="text-xs text-muted-foreground">{endorsement?.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustSignals;