import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const VendorCard = ({ vendor }) => {
  const getTimeRemaining = () => {
    const now = new Date();
    const resetTime = new Date(vendor.resetTime);
    const timeDiff = resetTime - now;
    
    if (timeDiff <= 0) return 'Expired';
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getRarityColor = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case 'exotic': return 'text-warning border-warning/30 bg-warning/10';
      case 'legendary': return 'text-purple-400 border-purple-400/30 bg-purple-400/10';
      case 'rare': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      default: return 'text-muted-foreground border-border bg-muted/20';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover-scale transition-tactical">
      {/* Vendor Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
          <Image
            src={vendor?.image}
            alt={vendor?.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">
            {vendor?.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {vendor?.location}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Resets in</div>
          <div className="text-sm font-mono text-primary">
            {getTimeRemaining()}
          </div>
        </div>
      </div>
      {/* Featured Items */}
      <div className="space-y-3">
        {vendor?.featuredItems?.slice(0, 2)?.map((item, index) => (
          <div key={index} className="flex items-center space-x-3 p-2 bg-muted/30 rounded-lg">
            <div className={`w-10 h-10 rounded border flex items-center justify-center ${getRarityColor(item?.rarity)}`}>
              <Icon name={item?.icon} size={16} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">
                {item?.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {item?.type}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1">
                <Icon name="Coins" size={12} className="text-warning" />
                <span className="text-xs font-mono text-foreground">
                  {item?.cost}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* View All Button */}
      <div className="mt-4 pt-3 border-t border-border">
        <button className="w-full text-sm text-primary hover:text-primary/80 transition-colors flex items-center justify-center space-x-1">
          <span>View All Items</span>
          <Icon name="ChevronRight" size={14} />
        </button>
      </div>
    </div>
  );
};

export default VendorCard;