import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

/**
 * Landing page component that serves as an authentication gateway.
 * Users must connect to Bungie before accessing the main application.
 */
const LandingPage = () => {
  const { user, loading, signInWithBungie, isAuthenticated } = useAuth();

  // Redirect authenticated users to dashboard
  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo/Brand Section */}
        <div className="space-y-4">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center shadow-2xl">
            <svg 
              className="w-12 h-12 text-white" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Guardian Nexus
          </h1>
          <p className="text-xl text-gray-300">
            Your Ultimate Destiny 2 Companion
          </p>
        </div>

        {/* Welcome Message */}
        <div className="space-y-4 py-8">
          <h2 className="text-2xl font-semibold text-white">
            Welcome, Guardian
          </h2>
          <p className="text-gray-300 leading-relaxed">
            To access your personalized Destiny 2 experience, including character management, 
            loadout optimization, and collection tracking, you'll need to connect your Bungie account.
          </p>
        </div>

        {/* Connect Button */}
        <div className="space-y-6">
          <button
            onClick={signInWithBungie}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-500/50"
          >
            <div className="flex items-center justify-center space-x-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="text-lg">Connect to Bungie</span>
            </div>
          </button>
          
          <p className="text-sm text-gray-400">
            By connecting, you authorize Guardian Nexus to access your Destiny 2 profile data 
            to provide personalized features and recommendations.
          </p>
        </div>

        {/* Features Preview */}
        <div className="pt-8 border-t border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            What you'll get access to:
          </h3>
          <div className="grid grid-cols-1 gap-3 text-left">
            <div className="flex items-center space-x-3 text-gray-300">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Character management and progression tracking</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-300">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Advanced loadout builder and optimizer</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-300">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Comprehensive weapon and armor database</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-300">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Collections and triumphs tracking</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 text-center">
          <p className="text-xs text-gray-500">
            Guardian Nexus is not affiliated with Bungie or Destiny 2.
            <br />
            All game content and materials are trademarks of Bungie, Inc.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;