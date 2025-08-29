import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const CharacterCard = ({ character, isActive, onClick }) => {
  const getClassIcon = (className) => {
    switch (className?.toLowerCase()) {
      case 'titan': return 'Shield';
      case 'hunter': return 'Zap';
      case 'warlock': return 'Sparkles';
      default: return 'User';
    }
  };

  const getClassColor = (className) => {
    switch (className?.toLowerCase()) {
      case 'titan': return 'text-orange-400';
      case 'hunter': return 'text-blue-400';
      case 'warlock': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div
      onClick={() => onClick(character)}
      className={`relative bg-card border rounded-lg p-4 cursor-pointer transition-tactical hover-scale ${
        isActive ? 'border-primary shadow-tactical' : 'border-border hover:border-primary/50'
      }`}
    >
      {/* Character Emblem Background */}
      <div className="absolute inset-0 rounded-lg overflow-hidden opacity-20">
        <Image
          src={character?.emblem}
          alt={`${character?.name} emblem`}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Icon 
              name={getClassIcon(character?.class)} 
              size={20} 
              className={getClassColor(character?.class)}
            />
            <span className="text-sm font-medium text-muted-foreground">
              {character?.class}
            </span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary font-mono">
              {character?.powerLevel}
            </div>
            <div className="text-xs text-muted-foreground">Power</div>
          </div>
        </div>

        {/* Character Name */}
        <h3 className="text-lg font-semibold text-foreground mb-2 truncate">
          {character?.name}
        </h3>

        {/* Equipped Exotic */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-8 h-8 bg-warning/20 rounded border border-warning/30 flex items-center justify-center">
            <Icon name="Star" size={16} className="text-warning" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">
              {character?.equippedExotic?.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {character?.equippedExotic?.type}
            </div>
          </div>
        </div>

        {/* Last Activity */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Last Activity:</span>
          <span>{character?.lastActivity}</span>
        </div>

        {/* Active Indicator */}
        {isActive && (
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterCard;