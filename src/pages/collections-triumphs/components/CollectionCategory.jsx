import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const CollectionCategory = ({ category, items, isExpanded, onToggle }) => {
  const completedItems = items?.filter(item => item?.acquired)?.length;
  const completionPercentage = Math.round((completedItems / items?.length) * 100);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-muted transition-tactical"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <Icon name={category?.icon} size={24} color="white" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-heading font-bold text-foreground">{category?.name}</h3>
            <p className="text-sm text-muted-foreground">
              {completedItems} of {items?.length} collected ({completionPercentage}%)
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-24 bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <Icon 
            name={isExpanded ? 'ChevronUp' : 'ChevronDown'} 
            size={20} 
            className="text-muted-foreground" 
          />
        </div>
      </button>
      {isExpanded && (
        <div className="border-t border-border p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items?.map((item) => (
              <div
                key={item?.id}
                className={`relative group cursor-pointer transition-tactical hover-scale ${
                  item?.acquired ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div className="aspect-square bg-muted rounded-lg overflow-hidden border border-border">
                  <Image
                    src={item?.icon}
                    alt={item?.name}
                    className="w-full h-full object-cover"
                  />
                  {!item?.acquired && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                      <Icon name="Lock" size={20} className="text-muted-foreground" />
                    </div>
                  )}
                  {item?.acquired && item?.isNew && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-xs font-medium text-foreground truncate">{item?.name}</p>
                  <p className="text-xs text-muted-foreground">{item?.rarity}</p>
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 w-48">
                  <p className="text-sm font-medium text-foreground">{item?.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item?.description}</p>
                  {!item?.acquired && (
                    <p className="text-xs text-accent mt-2">{item?.acquisitionHint}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionCategory;