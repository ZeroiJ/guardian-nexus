import { encryptToken, decryptToken, isTokenEncrypted } from '../utils/tokenSecurity';

// Bungie API Configuration
const BUNGIE_CONFIG = {
  clientId: import.meta.env?.VITE_BUNGIE_CLIENT_ID,
  authURL: 'https://www.bungie.net/en/OAuth/Authorize',
  redirectURI: `${window?.location?.origin}/auth/callback`,
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
    // Generate a random state parameter for CSRF protection
    const generatedState = crypto.randomUUID();
    
    // Store state in both localStorage and sessionStorage for redundancy
    localStorage.setItem('bungie_oauth_state', generatedState);
    sessionStorage.setItem('bungie_oauth_state', generatedState);
    
    // Also store in a cookie as backup (expires in 10 minutes)
    document.cookie = `bungie_oauth_state=${generatedState}; max-age=600; path=/; SameSite=Lax`;
    
    // Debug logging
    const storedStateLocal = localStorage.getItem('bungie_oauth_state');
    const storedStateSession = sessionStorage.getItem('bungie_oauth_state');
    console.log('OAuth Initiation Debug:', {
      generatedState,
      storedStateLocal,
      storedStateSession,
      localStorageWorking: storedStateLocal === generatedState,
      sessionStorageWorking: storedStateSession === generatedState
    });
    
    // Construct authorization URL
    const authURL = new URL(BUNGIE_CONFIG.authURL);
    authURL.searchParams.append('client_id', BUNGIE_CONFIG.clientId);
    authURL.searchParams.append('response_type', 'code');
    authURL.searchParams.append('redirect_uri', BUNGIE_CONFIG.redirectURI);
    authURL.searchParams.append('state', generatedState);
    
    // Redirect to Bungie OAuth
    window.location.href = authURL.toString();
  }

  /**
   * Helper function to get cookie value by name
   * @private
   */
  static getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  /**
   * Handles the OAuth callback and exchanges code for tokens
   * @param {string} code - Authorization code from Bungie
   * @param {string} state - State parameter for CSRF protection
   * @returns {Object} Authentication result with user profile and tokens
   */
  static async handleOAuthCallback(code, state) {
    try {
      // Verify state parameter - check multiple storage locations
      const storedStateLocal = localStorage.getItem('bungie_oauth_state');
      const storedStateSession = sessionStorage.getItem('bungie_oauth_state');
      const storedStateCookie = this.getCookie('bungie_oauth_state');
      
      console.log('OAuth State Debug:', {
        receivedState: state,
        storedStateLocal,
        storedStateSession,
        storedStateCookie,
        localMatch: state === storedStateLocal,
        sessionMatch: state === storedStateSession,
        cookieMatch: state === storedStateCookie
      });
      
      // Check if state matches any of the stored values
      const isValidState = state === storedStateLocal || 
                          state === storedStateSession || 
                          state === storedStateCookie;
      
      if (!isValidState) {
        throw new Error('Invalid state parameter - possible CSRF attack');
      }
      
      // Clean up stored state from all locations
      localStorage.removeItem('bungie_oauth_state');
      sessionStorage.removeItem('bungie_oauth_state');
      document.cookie = 'bungie_oauth_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

      // Exchange code for tokens
      const tokenResponse = await this.exchangeCodeForTokens(code);
      const { access_token, refresh_token, expires_in, membership_id } = tokenResponse;

      // Get user profile data
      const userProfile = await this.getCurrentUserProfile(access_token);
      
      // Store tokens and profile data in localStorage
      await this.storeBungieTokens({
        access_token,
        refresh_token,
        expires_in,
        bungie_user_id: userProfile?.membershipId || membership_id,
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
        code: code
      });

      // Backend returns {success: true, data: tokenData}
      // apiClient wraps it in {data: ...}, so we need response.data.data
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Invalid response format from token exchange API');
      }
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
   * Stores Bungie tokens and profile data in localStorage
   * @private
   */
  static async storeBungieTokens(tokenData) {
    const expiresAt = new Date(Date.now() + (tokenData?.expires_in * 1000));

    try {
      // Encrypt tokens before storing
      const encryptedAccessToken = encryptToken(tokenData?.access_token);
      const encryptedRefreshToken = encryptToken(tokenData?.refresh_token);

      const connectionData = {
        bungie_user_id: tokenData?.bungie_user_id,
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        expires_at: expiresAt?.toISOString(),
        display_name: tokenData?.display_name,
        profile_data: tokenData?.profile_data,
        is_active: true,
        updated_at: new Date()?.toISOString()
      };

      // Store in localStorage
      localStorage.setItem('bungie_connection', JSON.stringify(connectionData));
      localStorage.setItem('bungie_auth_status', 'connected');
      
    } catch (encryptionError) {
      console.error('Token encryption failed:', encryptionError.message);
      throw new Error('Failed to securely store tokens');
    }
  }

  /**
   * Gets stored Bungie connection from localStorage
   * @returns {Promise<Object|null>} Bungie connection data or null
   */
  static async getBungieConnection() {
    try {
      const connectionData = localStorage.getItem('bungie_connection');
      if (!connectionData) return null;

      const data = JSON.parse(connectionData);
      if (!data || !data.is_active) return null;

      // Decrypt tokens before returning
      const decryptedData = {
        ...data,
        access_token: isTokenEncrypted(data.access_token) ? decryptToken(data.access_token) : data.access_token,
        refresh_token: isTokenEncrypted(data.refresh_token) ? decryptToken(data.refresh_token) : data.refresh_token
      };
      
      return decryptedData;
    } catch (error) {
      console.error('Error fetching Bungie connection from localStorage:', error);
      // If parsing or decryption fails, clear corrupted data
      localStorage.removeItem('bungie_connection');
      localStorage.removeItem('bungie_auth_status');
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

      // Backend returns {success: true, data: tokenData}
      // apiClient wraps it in {data: ...}, so we need response.data.data
      let newTokens;
      if (response.data && response.data.success && response.data.data) {
        newTokens = response.data.data;
      } else {
        throw new Error('Invalid response format from token refresh API');
      }
      const expiresAt = new Date(Date.now() + (newTokens?.expires_in * 1000));

      // Encrypt new tokens before updating in localStorage
      try {
        const encryptedAccessToken = encryptToken(newTokens?.access_token);
        const encryptedRefreshToken = newTokens?.refresh_token ? 
          encryptToken(newTokens?.refresh_token) : 
          encryptToken(connection?.refresh_token);

        const updatedConnection = {
          ...connection,
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          expires_at: expiresAt?.toISOString(),
          updated_at: new Date()?.toISOString()
        };

        localStorage.setItem('bungie_connection', JSON.stringify(updatedConnection));
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
   * Disconnects Bungie account by clearing localStorage
   * @returns {Promise<boolean>} True if successful
   */
  static async disconnect() {
    try {
      // Clear all Bungie-related data from localStorage
      localStorage.removeItem('bungie_connection');
      localStorage.removeItem('bungie_auth_status');
      localStorage.removeItem('bungie_oauth_state');

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