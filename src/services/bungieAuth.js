import { supabase } from '../lib/supabase';
import axios from 'axios';

// API Configuration
const API_CONFIG = {
  backendURL: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3001',
  bungieAuthURL: 'https://www.bungie.net/en/OAuth/Authorize',
  redirectURI: `${window?.location?.origin}/auth/bungie/callback`,
  scopes: 'ReadBasicUserProfile ReadCharacterData ReadInventoryData ReadClanData ReadRecords'
};

// Axios instance for backend API calls
const backendAPI = axios?.create({
  baseURL: API_CONFIG?.backendURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Bungie Authentication Service
 * Handles OAuth flow with Bungie.net and stores tokens securely in Supabase
 */
export class BungieAuthService {
  /**
   * Initiates the Bungie OAuth flow by redirecting to Bungie's authorization page
   */
  static async initiateOAuth() {
    try {
      // Get OAuth URL from backend
      const response = await backendAPI?.get('/api/auth/bungie');
      
      if (response?.data?.authURL) {
        window.location.href = response?.data?.authURL;
      } else {
        throw new Error('Failed to get authorization URL from backend');
      }
    } catch (error) {
      console.error('Failed to initiate OAuth:', error);
      throw new Error(`Authentication initiation failed: ${error?.message}`);
    }
  }

  /**
   * Handles the OAuth callback and exchanges code for tokens
   * @param {string} code - Authorization code from Bungie
   * @param {string} state - State parameter for CSRF protection
   * @returns {Promise<Object>} Token response and user data
   */
  static async handleOAuthCallback(code, state) {
    try {
      // Send callback to backend for processing
      const response = await backendAPI?.post('/api/auth/bungie/callback', {
        code,
        state
      });

      if (response?.data?.success) {
        return {
          success: true,
          userProfile: response?.data?.userProfile,
          connection: response?.data?.connection
        };
      } else {
        throw new Error(response?.data?.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Bungie OAuth callback error:', error);
      throw new Error(`Authentication failed: ${error?.response?.data?.error || error?.message}`);
    }
  }

  /**
   * Gets stored Bungie connection for current user
   * @returns {Promise<Object|null>} Bungie connection data or null
   */
  static async getBungieConnection() {
    try {
      const response = await backendAPI?.get('/api/user/bungie-connection');
      return response?.data?.connection || null;
    } catch (error) {
      console.error('Error fetching Bungie connection:', error);
      return null;
    }
  }

  /**
   * Checks if current user has valid Bungie connection
   * @returns {Promise<boolean>} True if connected and valid
   */
  static async isConnected() {
    const connection = await this.getBungieConnection();
    return !!connection && connection?.is_active;
  }

  /**
   * Makes authenticated API request through backend proxy
   * @param {string} endpoint - Bungie API endpoint
   * @returns {Promise<Object>} API response
   */
  static async apiRequest(endpoint) {
    try {
      const response = await backendAPI?.get(`/api/bungie${endpoint}`);
      return response?.data;
    } catch (error) {
      console.error('Bungie API request failed:', error);
      throw new Error(`API request failed: ${error?.response?.data?.error || error?.message}`);
    }
  }

  /**
   * Disconnects Bungie account by deactivating the connection
   * @returns {Promise<boolean>} True if successful
   */
  static async disconnect() {
    try {
      const response = await backendAPI?.post('/api/user/disconnect-bungie');
      return response?.data?.success || false;
    } catch (error) {
      console.error('Disconnect error:', error);
      return false;
    }
  }

  /**
   * Gets user's Destiny memberships through backend
   * @returns {Promise<Array>} Array of membership data
   */
  static async getDestinyMemberships() {
    try {
      const response = await backendAPI?.get('/api/bungie/memberships');
      return response?.data;
    } catch (error) {
      console.error('Failed to get memberships:', error);
      throw new Error(`Failed to get memberships: ${error?.response?.data?.error || error?.message}`);
    }
  }
}

export { BungieAuthService };
export default BungieAuthService;