import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import AuthenticationCard from './components/AuthenticationCard';
import TrustSignals from './components/TrustSignals';
import FeaturePreview from './components/FeaturePreview';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';

const AuthenticationAuthorization = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, bungieConnection, loading, signInWithBungie } = useAuth();

  const [authState, setAuthState] = useState('idle'); // idle, loading, success, error
  const [error, setError] = useState(null);
  const [guardianData, setGuardianData] = useState(null);

  // Handle OAuth callback from Bungie
  useEffect(() => {
    const code = searchParams?.get('code');
    const state = searchParams?.get('state');
    const errorParam = searchParams?.get('error');

    if (errorParam) {
      setError({
        type: 'oauth_error',
        code: errorParam,
        message: 'Authorization was denied or failed',
        timestamp: new Date()?.toISOString()
      });
      setAuthState('error');
      return;
    }

    if (code && state) {
      setAuthState('loading');
      // OAuth callback is now handled by BungieCallback component
      // This page should redirect users who land here with callback params
      navigate('/bungie-callback' + window.location.search, { replace: true });
    }
  }, [searchParams, navigate]);

  // Update auth state based on Bungie connection
  useEffect(() => {
    if (bungieConnection && authState !== 'error') {
      setGuardianData({
        name: bungieConnection?.displayName || 'Guardian',
        platform: 'Bungie.net',
        connectionData: bungieConnection
      });
      setAuthState('success');

      // Redirect to dashboard after successful authentication
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  }, [bungieConnection, navigate, authState]);



  // Bungie authentication flow
  const handleAuthenticate = async (platform, rememberMe) => {
    if (platform !== 'bungie') {
      setError({
        type: 'unsupported_platform',
        code: 'PLATFORM-001',
        message: 'Only Bungie.net authentication is currently supported',
        timestamp: new Date()?.toISOString()
      });
      setAuthState('error');
      return;
    }

    try {
      setAuthState('loading');
      setError(null);

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('guardian_remember_me', 'true');
      } else {
        localStorage.removeItem('guardian_remember_me');
      }

      // Initiate Bungie OAuth
      await signInWithBungie();
    } catch (err) {
      setError({
        type: 'auth_initiation_failed',
        code: 'BNG-INIT',
        message: err?.message || 'Failed to start authentication process',
        timestamp: new Date()?.toISOString()
      });
      setAuthState('error');
    }
  };

  const handleRetry = () => {
    setAuthState('idle');
    setError(null);
    setGuardianData(null);
    // Clear URL parameters
    navigate('/authentication-authorization', { replace: true });
  };

  const handleGoBack = () => {
    setAuthState('idle');
    setError(null);
    setGuardianData(null);
    navigate('/authentication-authorization', { replace: true });
  };

  // Check for existing authentication on component mount
  useEffect(() => {
    // If already connected to Bungie, redirect to dashboard
    if (bungieConnection && !loading) {
      const rememberMe = localStorage.getItem('guardian_remember_me') === 'true';
      if (rememberMe) {
        navigate('/dashboard');
      }
    }
  }, [bungieConnection, loading, navigate]);

  const renderContent = () => {
    // Show loading if Bungie auth is loading or if we're in loading state
    if (loading || authState === 'loading' || authState === 'success') {
      return <LoadingState guardianData={guardianData} isConnecting={authState === 'loading'} />;
    }

    // Show error state
    if (authState === 'error') {
      return <ErrorState error={error} onRetry={handleRetry} onGoBack={handleGoBack} />;
    }

    // Show authentication card
    return (
      <AuthenticationCard 
        onAuthenticate={handleAuthenticate} 
        isLoading={authState === 'loading'}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-background via-background to-primary/5 py-12 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
                Connect Your <span className="text-primary">Guardian</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Securely link your Bungie.net account to unlock comprehensive Destiny 2 data tracking, 
                character management, and optimization tools.
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="flex flex-col xl:flex-row items-start justify-center gap-8 xl:gap-12">
              {/* Trust Signals - Left Side */}
              <TrustSignals />

              {/* Authentication Card - Center */}
              <div className="flex-shrink-0">
                {renderContent()}
              </div>

              {/* Feature Preview - Right Side */}
              <FeaturePreview />
            </div>
          </div>
        </div>

        {/* Security & Privacy Section */}
        <div className="py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                  Your Data is <span className="text-primary">Secure</span>
                </h2>
                <p className="text-muted-foreground">
                  We use official Bungie.net OAuth authentication to ensure your account remains safe and secure.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Shield" size={32} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Official API</h3>
                  <p className="text-sm text-muted-foreground">
                    Direct integration with Bungie's official API ensures authentic and up-to-date game data.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Lock" size={32} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">OAuth Security</h3>
                  <p className="text-sm text-muted-foreground">
                    Industry-standard OAuth 2.0 authentication protects your credentials and personal information.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Eye" size={32} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Read-Only Access</h3>
                  <p className="text-sm text-muted-foreground">
                    We only request read permissions to view your game data - we cannot modify anything.
                  </p>
                </div>
              </div>

              {/* Data Access Permissions */}
              <div className="mt-12 bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Icon name="Info" size={20} className="mr-2 text-primary" />
                  Data Access Permissions
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center text-muted-foreground">
                      <Icon name="Check" size={16} className="text-success mr-2" />
                      Character profiles and statistics
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Icon name="Check" size={16} className="text-success mr-2" />
                      Inventory and equipment data
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Icon name="Check" size={16} className="text-success mr-2" />
                      Triumph and collection progress
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-muted-foreground">
                      <Icon name="Check" size={16} className="text-success mr-2" />
                      Activity history and match data
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Icon name="Check" size={16} className="text-success mr-2" />
                      Clan membership information
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Icon name="Check" size={16} className="text-success mr-2" />
                      Seasonal progress tracking
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthenticationAuthorization;