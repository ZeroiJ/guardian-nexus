import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCharacterSwitcherOpen, setIsCharacterSwitcherOpen] = useState(false);

  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Characters', path: '/character-management', icon: 'Users' },
    { label: 'Database', path: '/weapon-armor-database', icon: 'Database' },
    { label: 'Builder', path: '/loadout-builder-optimizer', icon: 'Settings' },
    { label: 'Collections', path: '/collections-triumphs', icon: 'Trophy' }
  ];

  const mockCharacters = [
    {
      id: 1,
      name: 'Guardian Alpha',
      class: 'Titan',
      powerLevel: 1810,
      emblem: '/assets/images/no_image.png',
      lastActivity: '2 hours ago'
    },
    {
      id: 2,
      name: 'Guardian Beta',
      class: 'Hunter',
      powerLevel: 1805,
      emblem: '/assets/images/no_image.png',
      lastActivity: '1 day ago'
    },
    {
      id: 3,
      name: 'Guardian Gamma',
      class: 'Warlock',
      powerLevel: 1798,
      emblem: '/assets/images/no_image.png',
      lastActivity: '3 days ago'
    }
  ];

  const [selectedCharacter, setSelectedCharacter] = useState(mockCharacters?.[0]);

  const isActive = (path) => location?.pathname === path;

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    setIsCharacterSwitcherOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center space-x-3 hover-scale">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <Icon name="Shield" size={20} color="white" />
          </div>
          <span className="text-xl font-heading font-bold text-foreground text-shadow-glow">
            Guardian Nexus
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navigationItems?.map((item) => (
            <Link
              key={item?.path}
              to={item?.path}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-tactical hover-scale ${
                isActive(item?.path)
                  ? 'bg-primary text-primary-foreground shadow-tactical'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name={item?.icon} size={18} />
              <span className="font-body font-medium">{item?.label}</span>
            </Link>
          ))}
        </nav>

        {/* Character Switcher & User Actions */}
        <div className="flex items-center space-x-4">
          {/* Character Switcher */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setIsCharacterSwitcherOpen(!isCharacterSwitcherOpen)}
              className="flex items-center space-x-2 px-3 py-2"
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                <img
                  src={selectedCharacter?.emblem}
                  alt={selectedCharacter?.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/assets/images/no_image.png';
                  }}
                />
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-sm font-medium text-foreground">{selectedCharacter?.name}</div>
                <div className="text-xs text-muted-foreground font-mono">{selectedCharacter?.powerLevel}</div>
              </div>
              <Icon name="ChevronDown" size={16} />
            </Button>

            {/* Character Dropdown */}
            {isCharacterSwitcherOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-lg shadow-tactical-lg z-50">
                <div className="p-2">
                  {mockCharacters?.map((character) => (
                    <button
                      key={character?.id}
                      onClick={() => handleCharacterSelect(character)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-md transition-tactical hover:bg-muted ${
                        selectedCharacter?.id === character?.id ? 'bg-primary/10 border border-primary/20' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        <img
                          src={character?.emblem}
                          alt={character?.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/assets/images/no_image.png';
                          }}
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-foreground">{character?.name}</div>
                        <div className="text-xs text-muted-foreground">{character?.class}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono text-primary">{character?.powerLevel}</div>
                        <div className="text-xs text-muted-foreground">{character?.lastActivity}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
          >
            <Icon name={isMenuOpen ? 'X' : 'Menu'} size={20} />
          </Button>
        </div>
      </div>
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <nav className="p-4 space-y-2">
            {navigationItems?.map((item) => (
              <Link
                key={item?.path}
                to={item?.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-tactical ${
                  isActive(item?.path)
                    ? 'bg-primary text-primary-foreground shadow-tactical'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item?.icon} size={20} />
                <span className="font-body font-medium">{item?.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
      {/* Click outside to close dropdowns */}
      {(isCharacterSwitcherOpen || isMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsCharacterSwitcherOpen(false);
            setIsMenuOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;