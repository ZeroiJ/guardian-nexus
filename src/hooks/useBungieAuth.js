import { useState, useEffect, useCallback } from 'react';
import { BungieAuthService } from '../services/bungieAuth';
import { BungieAPIService } from '../services/bungieAPI';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for managing Bungie authentication state and operations
 * @returns {Object} Bungie auth state and methods
 */
export const useBungieAuth = () => {
  const { user } = useAuth();
  const [state, setState] = useState({
    isConnected: false,
    isLoading: true,
    connection: null,
    membership: null,
    error: null,
    characters: null
  });

  /**
   * Updates the state with new values
   */
  const updateState = useCallback((updates) => {
    setState(prevState => ({ ...prevState, ...updates }));
  }, []);

  /**
   * Checks connection status and loads user data
   */
  const checkConnection = useCallback(async () => {
    if (!user) {
      updateState({
        isConnected: false,
        isLoading: false,
        connection: null,
        membership: null,
        characters: null,
        error: null
      });
      return;
    }

    try {
      updateState({ isLoading: true, error: null });

      const connection = await BungieAuthService?.getBungieConnection();
      const isConnected = await BungieAuthService?.isConnected();

      if (isConnected && connection) {
        // Try to get membership and character data
        try {
          const membership = await BungieAPIService?.getPrimaryMembership();
          const charactersData = membership ? await BungieAPIService?.getAllCharacters() : null;

          updateState({
            isConnected: true,
            connection,
            membership,
            characters: charactersData?.characters || null,
            error: null
          });
        } catch (apiError) {
          console.warn('Failed to load Bungie data:', apiError);
          updateState({
            isConnected: true,
            connection,
            membership: null,
            characters: null,
            error: `Failed to load game data: ${apiError?.message}`
          });
        }
      } else {
        updateState({
          isConnected: false,
          connection: null,
          membership: null,
          characters: null,
          error: null
        });
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      updateState({
        isConnected: false,
        connection: null,
        membership: null,
        characters: null,
        error: error?.message || 'Connection check failed'
      });
    } finally {
      updateState({ isLoading: false });
    }
  }, [user, updateState]);

  /**
   * Initiates Bungie OAuth flow
   */
  const connect = useCallback(() => {
    if (!user) {
      updateState({ error: 'Please log in first' });
      return;
    }

    try {
      BungieAuthService?.initiateOAuth();
    } catch (error) {
      updateState({ error: error?.message || 'Failed to start authentication' });
    }
  }, [user, updateState]);

  /**
   * Handles OAuth callback
   */
  const handleCallback = useCallback(async (code, state) => {
    try {
      updateState({ isLoading: true, error: null });
      
      const result = await BungieAuthService?.handleOAuthCallback(code, state);
      
      if (result?.success) {
        // Refresh connection data
        await checkConnection();
        return { success: true, data: result };
      } else {
        throw new Error('Authentication callback failed');
      }
    } catch (error) {
      updateState({ 
        error: error?.message || 'Authentication failed',
        isLoading: false
      });
      return { success: false, error: error?.message };
    }
  }, [checkConnection, updateState]);

  /**
   * Disconnects Bungie account
   */
  const disconnect = useCallback(async () => {
    try {
      updateState({ isLoading: true, error: null });
      
      const success = await BungieAuthService?.disconnect();
      
      if (success) {
        updateState({
          isConnected: false,
          connection: null,
          membership: null,
          characters: null,
          error: null,
          isLoading: false
        });
        return { success: true };
      } else {
        throw new Error('Failed to disconnect');
      }
    } catch (error) {
      updateState({ 
        error: error?.message || 'Disconnect failed',
        isLoading: false
      });
      return { success: false, error: error?.message };
    }
  }, [updateState]);

  /**
   * Refreshes user data from Bungie API
   */
  const refreshData = useCallback(async () => {
    if (!state?.isConnected) return { success: false, error: 'Not connected' };

    try {
      updateState({ isLoading: true, error: null });
      
      const membership = await BungieAPIService?.getPrimaryMembership();
      const charactersData = membership ? await BungieAPIService?.getAllCharacters() : null;

      updateState({
        membership,
        characters: charactersData?.characters || null,
        error: null,
        isLoading: false
      });

      return { success: true };
    } catch (error) {
      updateState({ 
        error: error?.message || 'Failed to refresh data',
        isLoading: false
      });
      return { success: false, error: error?.message };
    }
  }, [state?.isConnected, updateState]);

  /**
   * Gets character data by ID
   */
  const getCharacter = useCallback(async (characterId) => {
    if (!state?.membership) {
      throw new Error('No membership data available');
    }

    return await BungieAPIService?.getCharacter(
      state?.membership?.membershipType,
      state?.membership?.membershipId,
      characterId
    );
  }, [state?.membership]);

  /**
   * Gets activity history for a character
   */
  const getCharacterActivities = useCallback(async (characterId, count = 10) => {
    if (!state?.membership) {
      throw new Error('No membership data available');
    }

    return await BungieAPIService?.getActivityHistory(
      state?.membership?.membershipType,
      state?.membership?.membershipId,
      characterId,
      count
    );
  }, [state?.membership]);

  // Check connection on mount and when user changes
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!state?.connection || !state?.isConnected) return;

    const expiresAt = new Date(state?.connection?.expires_at);
    const now = new Date();
    const timeUntilExpiry = expiresAt?.getTime() - now?.getTime();

    // Refresh 5 minutes before expiry
    const refreshTime = timeUntilExpiry - (5 * 60 * 1000);

    if (refreshTime > 0) {
      const timeoutId = setTimeout(() => {
        BungieAuthService?.refreshAccessToken()?.then(() => {
          checkConnection(); // Reload connection data
        });
      }, refreshTime);

      return () => clearTimeout(timeoutId);
    }
  }, [state?.connection, state?.isConnected, checkConnection]);

  return {
    // State
    ...state,
    
    // Methods
    connect,
    disconnect,
    handleCallback,
    refreshData,
    checkConnection,
    
    // API helpers
    getCharacter,
    getCharacterActivities,
    
    // Computed properties
    hasCharacters: !!state?.characters && Object.keys(state?.characters)?.length > 0,
    connectionExpiry: state?.connection?.expires_at ? new Date(state?.connection?.expires_at) : null,
    isTokenExpiring: state?.connection?.expires_at ? 
      (new Date(state?.connection?.expires_at)?.getTime() - Date.now()) < (10 * 60 * 1000) : false
  };
};

export default useBungieAuth;