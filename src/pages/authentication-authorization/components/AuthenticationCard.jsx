import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const AuthenticationCard = ({ onAuthenticate, isLoading = false }) => {
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('bungie');

  const handleConnect = () => {
    onAuthenticate?.(selectedPlatform, rememberMe);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-8 w-full max-w-md mx-auto shadow-lg">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Shield" size={32} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Connect to Bungie.net</h2>
        <p className="text-sm text-muted-foreground">
          Link your Guardian account to access your Destiny 2 data
        </p>
      </div>
      {/* Platform Selection */}
      <div className="space-y-4 mb-6">
        <label className="text-sm font-medium text-foreground">Select Platform</label>
        
        <div className="border border-border rounded-lg p-1 bg-muted/50">
          <button
            onClick={() => setSelectedPlatform('bungie')}
            className={`w-full flex items-center justify-between p-3 rounded-md transition-colors ${
              selectedPlatform === 'bungie' ?'bg-card border border-primary text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }`}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                <Icon name="Gamepad2" size={16} className="text-primary" />
              </div>
              <div className="text-left">
                <div className="font-medium">Bungie.net</div>
                <div className="text-xs text-muted-foreground">All Platforms</div>
              </div>
            </div>
            {selectedPlatform === 'bungie' && (
              <Icon name="Check" size={20} className="text-primary" />
            )}
          </button>
        </div>
      </div>
      {/* Remember Me */}
      <div className="flex items-center space-x-3 mb-6">
        <Checkbox
          id="remember-me"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e?.target?.checked)}
        />
        <label htmlFor="remember-me" className="text-sm text-muted-foreground cursor-pointer">
          Keep me logged in for 30 days
        </label>
      </div>
      {/* Connect Button */}
      <Button
        onClick={handleConnect}
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        size="lg"
      >
        {isLoading ? (
          <>
            <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Icon name="Link" size={20} className="mr-2" />
            Connect to Bungie.net
          </>
        )}
      </Button>
      {/* Security Note */}
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Secure OAuth 2.0 authentication • Read-only access • 
          <br />
          Your credentials are never stored
        </p>
      </div>
      {/* Help Link */}
      <div className="mt-4 text-center">
        <a
          href="#"
          className="text-xs text-primary hover:text-primary/80 underline"
          onClick={(e) => {
            e?.preventDefault();
            // Could open a help modal or navigate to help page
          }}
        >
          Need help connecting your account?
        </a>
      </div>
    </div>
  );
};

export default AuthenticationCard;