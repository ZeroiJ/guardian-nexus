import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const CharacterModel = ({ character }) => {
  const getClassIcon = (className) => {
    switch (className) {
      case 'Titan': return 'Shield';
      case 'Hunter': return 'Zap';
      case 'Warlock': return 'Sparkles';
      default: return 'User';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
        {/* Character Avatar */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-32 h-32 lg:w-48 lg:h-48 rounded-full bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center overflow-hidden">
              <Image
                src={character?.avatar}
                alt={`${character?.name} avatar`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-card border-2 border-primary rounded-full flex items-center justify-center">
              <Icon name={getClassIcon(character?.class)} size={20} color="var(--color-primary)" />
            </div>
          </div>
        </div>

        {/* Character Info */}
        <div className="flex-1 text-center lg:text-left">
          <div className="mb-4">
            <h1 className="text-2xl lg:text-3xl font-heading font-bold text-foreground mb-2">
              {character?.name}
            </h1>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm">
              <span className="flex items-center space-x-1 text-primary">
                <Icon name={getClassIcon(character?.class)} size={16} />
                <span>{character?.class}</span>
              </span>
              <span className="flex items-center space-x-1 text-muted-foreground">
                <Icon name="Clock" size={16} />
                <span>{character?.playtime}</span>
              </span>
              <span className="flex items-center space-x-1 text-success">
                <Icon name="Activity" size={16} />
                <span>{character?.lastActivity}</span>
              </span>
            </div>
          </div>

          {/* Power Level & Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-muted rounded-lg p-3 text-center">
              <div className="text-2xl font-mono font-bold text-primary">{character?.powerLevel}</div>
              <div className="text-xs text-muted-foreground">Power Level</div>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <div className="text-2xl font-mono font-bold text-foreground">{character?.stats?.mobility}</div>
              <div className="text-xs text-muted-foreground">Mobility</div>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <div className="text-2xl font-mono font-bold text-foreground">{character?.stats?.resilience}</div>
              <div className="text-xs text-muted-foreground">Resilience</div>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <div className="text-2xl font-mono font-bold text-foreground">{character?.stats?.recovery}</div>
              <div className="text-xs text-muted-foreground">Recovery</div>
            </div>
          </div>

          {/* Subclass Info */}
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-center lg:justify-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <Icon name="Zap" size={16} color="white" />
              </div>
              <div>
                <div className="font-medium text-foreground">{character?.subclass?.name}</div>
                <div className="text-sm text-muted-foreground">{character?.subclass?.element}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterModel;