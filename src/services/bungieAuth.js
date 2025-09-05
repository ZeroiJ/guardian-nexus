import { supabase } from '../lib/supabase';
import { encryptToken, decryptToken, isTokenEncrypted } from '../utils/tokenSecurity';

// Bungie API Configuration
const BUNGIE_CONFIG = {
  clientId: import.meta.env?.VITE_BUNGIE_CLIENT_ID,
  authURL: 'https://www.bungie.net/en/OAuth/Authorize',
  redirectURI: `${window?.location?.origin}/auth/bungie/callback`,
  scopes: 'ReadBasicUserProfile ReadCharacterData ReadInventoryData ReadClanData ReadRecords',
  // API base URL - uses relative paths for Vercel deployment
  apiBaseURL: '/api'
};

/**
 * Fetch-based API client helper
 */
const apiClient = {
  async post(url, data, options = {}) {
    const response = await fetch(`${BUNGIE_CONFIG.apiBaseURL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return { data: await response.json() };
  },
  
  async get(url, options = {}) {
    const response = await fetch(`${BUNGIE_CONFIG.apiBaseURL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return { data: await response.json() };
  }
};

/**
 * Bungie Authentication Service
 * Handles OAuth flow with Bungie.net and stores tokens securely in Supabase
 */
export class BungieAuthService {
  /**
   * Initiates the Bungie OAuth flow by redirecting to Bungie's authorization page
   */
  static initiateOAuth() {
    const state = crypto.randomUUID();
    localStorage.setItem('bungie_oauth_state', state);

    const authParams = new URLSearchParams({
      client_id: BUNGIE_CONFIG.clientId,
      response_type: 'code',
      redirect_uri: BUNGIE_CONFIG.redirectURI,
      state: state
    });

    const authURL = `${BUNGIE_CONFIG?.authURL}?${authParams?.toString()}`;
    window.location.href = authURL;
  }

  /**
   * Handles the OAuth callback and exchanges code for tokens
   * @param {string} code - Authorization code from Bungie
   * @param {string} state - State parameter for CSRF protection
   * @returns {Promise<Object>} Token response and user data
   */
  static async handleOAuthCallback(code, state) {
    try {
      // Verify state parameter
      const storedState = localStorage.getItem('bungie_oauth_state');
      if (state !== storedState) {
        throw new Error('Invalid state parameter - possible CSRF attack');
      }
      localStorage.removeItem('bungie_oauth_state');

      // Exchange code for tokens
      const tokenResponse = await this.exchangeCodeForTokens(code);
      const { access_token, refresh_token, expires_in } = tokenResponse;

      // Get user profile data
      const userProfile = await this.getCurrentUserProfile(access_token);
      
      // Get current Supabase user
      const { data: { user: supabaseUser } } = await supabase?.auth?.getUser();
      if (!supabaseUser) {
        throw new Error('User must be logged into Supabase first');
      }

      // Store tokens and profile data in Supabase
      await this.storeBungieTokens(supabaseUser?.id, {
        access_token,
        refresh_token,
        expires_in,
        bungie_user_id: userProfile?.membershipId,
        display_name: userProfile?.displayName,
        profile_data: userProfile
      });

      return {
        success: true,
        userProfile,
        tokens: { access_token, refresh_token, expires_in }
      };

    } catch (error) {
      console.error('Bungie OAuth callback error:', error);
      throw new Error(`Authentication failed: ${error?.message}`);
    }
  }

  /**
   * Exchanges authorization code for access/refresh tokens
   * @private
   */
  static async exchangeCodeForTokens(code) {
    try {
      const response = await apiClient.post('/bungie/oauth/token', {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: BUNGIE_CONFIG.redirectURI
      });

      return response.data;
    } catch (error) {
      console.error('Token exchange error:', error);
      throw new Error(`Token exchange failed: ${error.message}`);
    }
  }

  /**
   * Gets current user profile from Bungie API via backend proxy
   * @private
   */
  static async getCurrentUserProfile(accessToken) {
    try {
      const response = await apiClient.get('/bungie/user/profile', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  /**
   * Stores Bungie tokens and profile data in Supabase
   * @private
   */
  static async storeBungieTokens(userId, tokenData) {
    const expiresAt = new Date(Date.now() + (tokenData?.expires_in * 1000));

    try {
      // Encrypt tokens before storing
      const encryptedAccessToken = encryptToken(tokenData?.access_token);
      const encryptedRefreshToken = encryptToken(tokenData?.refresh_token);

      const { error } = await supabase?.from('bungie_connections')?.upsert({
          user_id: userId,
          bungie_user_id: tokenData?.bungie_user_id,
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          expires_at: expiresAt?.toISOString(),
          display_name: tokenData?.display_name,
          profile_data: tokenData?.profile_data,
          is_active: true,
          updated_at: new Date()?.toISOString()
        });

      if (error) {
        throw new Error(`Failed to store tokens: ${error?.message}`);
      }
    } catch (encryptionError) {
      console.error('Token encryption failed:', encryptionError.message);
      throw new Error('Failed to securely store tokens');
    }
  }

  /**
   * Gets stored Bungie connection for current user
   * @returns {Promise<Object|null>} Bungie connection data or null
   */
  static async getBungieConnection() {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) return null;

    const { data, error } = await supabase?.from('bungie_connections')?.select('*')?.eq('user_id', user?.id)?.eq('is_active', true)?.single();

    if (error && error?.code !== 'PGRST116') {
      console.error('Error fetching Bungie connection:', error);
      return null;
    }

    if (!data) return null;

    try {
      // Decrypt tokens before returning
      const decryptedData = {
        ...data,
        access_token: isTokenEncrypted(data.access_token) ? decryptToken(data.access_token) : data.access_token,
        refresh_token: isTokenEncrypted(data.refresh_token) ? decryptToken(data.refresh_token) : data.refresh_token
      };
      
      return decryptedData;
    } catch (decryptionError) {
      console.error('Token decryption failed:', decryptionError.message);
      // If decryption fails, the tokens might be corrupted - return null to force re-authentication
      return null;
    }
  }

  /**
   * Checks if current user has valid Bungie connection
   * @returns {Promise<boolean>} True if connected and valid
   */
  static async isConnected() {
    const connection = await this.getBungieConnection();
    if (!connection) return false;

    const now = new Date();
    const expiresAt = new Date(connection?.expires_at);
    
    return now < expiresAt;
  }

  /**
   * Refreshes access token using refresh token via backend proxy
   * @returns {Promise<boolean>} True if refresh successful
   */
  static async refreshAccessToken() {
    try {
      const connection = await this.getBungieConnection();
      if (!connection?.refresh_token) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/bungie/oauth/token', {
        grant_type: 'refresh_token',
        refresh_token: connection?.refresh_token
      });

      const newTokens = response.data;
      const expiresAt = new Date(Date.now() + (newTokens?.expires_in * 1000));

      // Encrypt new tokens before updating in database
      try {
        const encryptedAccessToken = encryptToken(newTokens?.access_token);
        const encryptedRefreshToken = newTokens?.refresh_token ? 
          encryptToken(newTokens?.refresh_token) : 
          encryptToken(connection?.refresh_token);

        const { error } = await supabase?.from('bungie_connections')?.update({
            access_token: encryptedAccessToken,
            refresh_token: encryptedRefreshToken,
            expires_at: expiresAt?.toISOString(),
            updated_at: new Date()?.toISOString()
          })?.eq('id', connection?.id);

        if (error) {
          throw new Error(`Failed to update tokens: ${error?.message}`);
        }
      } catch (encryptionError) {
        console.error('Token encryption failed during refresh:', encryptionError.message);
        throw new Error('Failed to securely update tokens');
      }

      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  /**
   * Gets valid access token, refreshing if necessary
   * @returns {Promise<string|null>} Valid access token or null
   */
  static async getValidAccessToken() {
    const connection = await this.getBungieConnection();
    if (!connection) return null;

    const now = new Date();
    const expiresAt = new Date(connection?.expires_at);

    // Token expires in less than 5 minutes, refresh it
    if (expiresAt?.getTime() - now?.getTime() < 5 * 60 * 1000) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) return null;
      
      // Get updated connection
      const updatedConnection = await this.getBungieConnection();
      return updatedConnection?.access_token;
    }

    return connection?.access_token;
  }

  /**
   * Disconnects Bungie account by deactivating the connection
   * @returns {Promise<boolean>} True if successful
   */
  static async disconnect() {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) return false;

      const { error } = await supabase?.from('bungie_connections')?.update({ is_active: false })?.eq('user_id', user?.id);

      if (error) {
        throw new Error(`Failed to disconnect: ${error?.message}`);
      }

      return true;
    } catch (error) {
      console.error('Disconnect error:', error);
      return false;
    }
  }

  /**
   * Makes authenticated request to Bungie API
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} API response data
   */
  static async apiRequest(endpoint, options = {}) {
    const accessToken = await this.getValidAccessToken();
    if (!accessToken) {
      throw new Error('No valid access token available');
    }

    try {
      const response = await apiClient.request({
        url: `/bungie/proxy${endpoint}`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          ...options?.headers
        },
        ...options
      });

      return response.data;
    } catch (error) {
      console.error('Bungie API request error:', error);
      throw new Error(`Bungie API error: ${error.message}`);
    }
  }

  /**
   * Gets user's Destiny memberships via backend proxy
   * @returns {Promise<Array>} Array of membership data
   */
  static async getDestinyMemberships() {
    const accessToken = await this.getValidAccessToken();
    if (!accessToken) {
      throw new Error('No valid access token available');
    }

    try {
      const response = await apiClient.get('/bungie/user/memberships', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Get memberships error:', error);
      throw new Error(`Failed to get memberships: ${error.message}`);
    }
  }

  /**
   * Gets characters for a specific membership via backend proxy
   * @param {number} membershipType - Platform type (1=Xbox, 2=PSN, 3=Steam, etc.)
   * @param {string} membershipId - Platform membership ID
   * @returns {Promise<Object>} Characters data
   */
  static async getCharacters(membershipType, membershipId) {
    const accessToken = await this.getValidAccessToken();
    if (!accessToken) {
      throw new Error('No valid access token available');
    }

    try {
      const response = await apiClient.get(`/destiny2/profile/${membershipType}/${membershipId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          components: '200' // Characters component
        }
      });

      return response.data;
    } catch (error) {
      console.error('Get characters error:', error);
      throw new Error(`Failed to get characters: ${error.message}`);
    }
  }
}

export default BungieAuthService;