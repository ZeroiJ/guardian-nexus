import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const CharacterSelector = ({ characters, selectedCharacter, onCharacterSelect }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-bold text-foreground">Select Guardian</h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Users" size={16} />
          <span>{characters?.length} Characters</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {characters?.map((character) => (
          <button
            key={character?.id}
            onClick={() => onCharacterSelect(character)}
            className={`p-4 rounded-lg border transition-tactical hover-scale ${
              selectedCharacter?.id === character?.id
                ? 'border-primary bg-primary/10 shadow-tactical'
                : 'border-border bg-muted hover:border-primary/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                <Image
                  src={character?.emblem}
                  alt={`${character?.name} emblem`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-left">
                <div className="font-heading font-bold text-foreground">{character?.name}</div>
                <div className="text-sm text-muted-foreground">{character?.class}</div>
                <div className="text-xs font-mono text-primary">{character?.powerLevel} Power</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">{character?.playtime}</div>
                <div className="text-xs text-success">{character?.lastActivity}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CharacterSelector;