import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BungieAuthService } from '../../services/bungieAuth';
import Icon from '../AppIcon';

/**
 * UserProfile Component
 * Displays authenticated Bungie user data including profile info, memberships, and characters
 */
const UserProfile = ({ className = '' }) => {
  const { user, bungieConnection, loading } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState(null);

  // Load detailed profile data when component mounts
  useEffect(() => {
    if (bungieConnection && !profileData) {
      loadProfileData();
    }
  }, [bungieConnection]);

  /**
   * Loads detailed Bungie profile data including memberships and characters
   */
  const loadProfileData = async () => {
    try {
      setLoadingProfile(true);
      setError(null);

      // Get Destiny memberships
      const membershipResponse = await BungieAuthService.getDestinyMemberships();
      if (membershipResponse?.success && membershipResponse?.data?.destinyMemberships) {
        setMemberships(membershipResponse.data.destinyMemberships);

        // Get characters for the first membership (primary platform)
        const primaryMembership = membershipResponse.data.destinyMemberships[0];
        if (primaryMembership) {
          const characterResponse = await BungieAuthService.getCharacters(
            primaryMembership.membershipType,
            primaryMembership.membershipId
          );
          if (characterResponse?.success && characterResponse?.data?.characters) {
            setCharacters(Object.values(characterResponse.data.characters.data || {}));
          }
        }
      }

      setProfileData({
        displayName: bungieConnection.displayName,
        bungieId: bungieConnection.bungie_user_id,
        profileData: bungieConnection.profile_data
      });
    } catch (err) {
      console.error('Failed to load profile data:', err);
      setError(err.message || 'Failed to load profile data');
    } finally {
      setLoadingProfile(false);
    }
  };

  /**
   * Gets platform icon based on membership type
   */
  const getPlatformIcon = (membershipType) => {
    const platforms = {
      1: 'xbox', // Xbox
      2: 'playstation', // PlayStation
      3: 'steam', // Steam
      4: 'blizzard', // Battle.net
      5: 'stadia', // Stadia
      6: 'epic' // Epic Games
    };
    return platforms[membershipType] || 'bungie';
  };

  /**
   * Gets class name from class hash
   */
  const getClassName = (classHash) => {
    const classes = {
      671679327: 'Hunter',
      2271682572: 'Warlock',
      3655393761: 'Titan'
    };
    return classes[classHash] || 'Unknown';
  };

  /**
   * Gets race name from race hash
   */
  const getRaceName = (raceHash) => {
    const races = {
      3887404748: 'Human',
      898834093: 'Awoken',
      2803282938: 'Exo'
    };
    return races[raceHash] || 'Unknown';
  };

  if (loading || loadingProfile) {
    return (
      <div className={`bg-gray-900 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-700 rounded w-32"></div>
              <div className="h-4 bg-gray-700 rounded w-24"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!bungieConnection) {
    return (
      <div className={`bg-gray-900 rounded-lg p-6 text-center ${className}`}>
        <Icon name="bungie" className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-white mb-2">No Bungie Connection</h3>
        <p className="text-gray-400">Connect your Bungie account to view profile data</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-900/20 border border-red-500/30 rounded-lg p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <Icon name="alert-circle" className="w-6 h-6 text-red-400" />
          <h3 className="text-lg font-semibold text-red-400">Profile Load Error</h3>
        </div>
        <p className="text-red-300 mb-4">{error}</p>
        <button
          onClick={loadProfileData}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-lg p-6 ${className}`}>
      {/* Profile Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Icon name="bungie" className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">{profileData?.displayName || 'Guardian'}</h2>
          <p className="text-gray-400">Bungie ID: {profileData?.bungieId}</p>
        </div>
      </div>

      {/* Platform Memberships */}
      {memberships.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Platform Memberships</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {memberships.map((membership, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4 flex items-center space-x-3">
                <Icon 
                  name={getPlatformIcon(membership.membershipType)} 
                  className="w-8 h-8 text-blue-400" 
                />
                <div>
                  <p className="text-white font-medium">{membership.displayName}</p>
                  <p className="text-gray-400 text-sm">ID: {membership.membershipId}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Characters */}
      {characters.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Characters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {characters.slice(0, 3).map((character, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{character.light}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {getClassName(character.classHash)}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {getRaceName(character.raceHash)}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Power Level:</span>
                    <span className="text-white font-medium">{character.light}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Last Played:</span>
                    <span className="text-white font-medium">
                      {new Date(character.dateLastPlayed).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-400 text-sm font-medium">Connected to Bungie.net</span>
          </div>
          <button
            onClick={loadProfileData}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;