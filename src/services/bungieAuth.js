import { encryptToken, decryptToken, isTokenEncrypted } from '../utils/tokenSecurity';
import logger from '../utils/logger';
import { validateOAuthState, safeFetch, cleanupOAuthState, GuardianError, ERROR_CODES } from '../utils/errorHandler';

// Bungie API Configuration
const BUNGIE_CONFIG = {
  clientId: import.meta.env?.VITE_BUNGIE_CLIENT_ID,
  authURL: 'https://www.bungie.net/en/OAuth/Authorize',
  get redirectURI() {
    // Dynamically construct redirect URI to handle different environments
    const origin = window?.location?.origin || 'http://localhost:4028';
    return `${origin}/auth/callback`;
  },
  scopes: 'ReadBasicUserProfile ReadCharacterData ReadInventoryData ReadClanData ReadRecords',
  // API base URL - uses relative paths for Vercel deployment
  apiBaseURL: import.meta.env.VITE_BACKEND_URL || '/api'
};

/**
 * Fetch-based API client helper
 */
const apiClient = {
  async post(url, data, options = {}) {
    const fullUrl = `${BUNGIE_CONFIG.apiBaseURL}${url}`;
    
    try {
      const response = await safeFetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: JSON.stringify(data),
        timeout: 15000,
        retries: 2
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(`API request failed: ${response.status} ${response.statusText}`);
        error.status = response.status;
        error.statusText = response.statusText;
        error.url = fullUrl;
        logger.apiError(url, error, { method: 'POST', data, errorData });
        throw error;
      }
      
      return { data: await response.json() };
    } catch (fetchError) {
      if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
        logger.apiError(url, fetchError, { 
          method: 'POST', 
          url: fullUrl,
          issue: 'Network or CORS error',
          data 
        });
        throw new Error(`Network error: Unable to connect to ${fullUrl}. Check CORS configuration.`);
      }
      throw fetchError;
    }
  },
  
  async get(url, options = {}) {
    const fullUrl = `${BUNGIE_CONFIG.apiBaseURL}${url}`;
    
    try {
      const response = await safeFetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        timeout: 15000,
        retries: 2
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(`API request failed: ${response.status} ${response.statusText}`);
        error.status = response.status;
        error.statusText = response.statusText;
        error.url = fullUrl;
        logger.apiError(url, error, { method: 'GET', errorData });
        throw error;
      }
      
      return { data: await response.json() };
    } catch (fetchError) {
      if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
        logger.apiError(url, fetchError, { 
          method: 'GET', 
          url: fullUrl,
          issue: 'Network or CORS error'
        });
        throw new Error(`Network error: Unable to connect to ${fullUrl}. Check CORS configuration.`);
      }
      throw fetchError;
    }
  }
};

/**
 * Bungie Authentication Service
 * Handles OAuth flow with Bungie.net and stores tokens securely in Supabase
 */
export class BungieAuthService {
  /**
   * Generates a cryptographically secure random state for OAuth
   * @private
   */
  static generateOAuthState() {
    // Use crypto.randomUUID() if available, otherwise fallback to secure alternative
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback: Generate secure random state using crypto.getRandomValues
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    // Final fallback: Use Math.random with timestamp (less secure but functional)
    console.warn('Using fallback random state generation - less secure');
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Initiates the Bungie OAuth flow by redirecting to Bungie's authorization page
   */
  static initiateOAuth() {
    try {
      // Generate a random state parameter for CSRF protection
      const generatedState = this.generateOAuthState();
      
      if (!generatedState) {
        throw new Error('Failed to generate OAuth state');
      }
      
      // Clear any existing state first to prevent conflicts
      localStorage.removeItem('bungie_oauth_state');
      sessionStorage.removeItem('bungie_oauth_state');
      document.cookie = 'bungie_oauth_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Store state with timestamp for expiration checking (15 minutes)
      const stateData = {
        state: generatedState,
        timestamp: Date.now(),
        expires: Date.now() + (15 * 60 * 1000) // 15 minutes
      };
      
      const stateString = JSON.stringify(stateData);
      
      // Store state in multiple locations for redundancy
      localStorage.setItem('bungie_oauth_state', stateString);
      sessionStorage.setItem('bungie_oauth_state', stateString);
      
      // Store in cookie with secure settings (expires in 15 minutes)
      const isSecure = window.location.protocol === 'https:';
      document.cookie = `bungie_oauth_state=${encodeURIComponent(stateString)}; max-age=900; path=/; SameSite=Lax${isSecure ? '; Secure' : ''}`;
    
      // Enhanced debug logging with new state format
      const storedStateLocal = localStorage.getItem('bungie_oauth_state');
      const storedStateSession = sessionStorage.getItem('bungie_oauth_state');
      
      // Verify state storage worked correctly
      let localStateValid = false;
      let sessionStateValid = false;
      
      try {
        const localParsed = JSON.parse(storedStateLocal);
        localStateValid = localParsed.state === generatedState;
      } catch {
        localStateValid = false;
      }
      
      try {
        const sessionParsed = JSON.parse(storedStateSession);
        sessionStateValid = sessionParsed.state === generatedState;
      } catch {
        sessionStateValid = false;
      }
      
      console.log('OAuth Initiation Debug - Enhanced:', {
        generatedState: generatedState.slice(0, 8) + '...',
        generatedStateLength: generatedState?.length,
        stateDataStored: !!storedStateLocal,
        localStorageWorking: localStateValid,
        sessionStorageWorking: sessionStateValid,
        currentOrigin: window.location.origin,
        redirectURI: BUNGIE_CONFIG.redirectURI,
        cookieSet: document.cookie.includes('bungie_oauth_state'),
        expiresAt: new Date(stateData.expires).toISOString(),
        timestamp: new Date().toISOString()
      });
      
      // Construct authorization URL
      const authURL = new URL(BUNGIE_CONFIG.authURL);
      authURL.searchParams.append('client_id', BUNGIE_CONFIG.clientId);
      authURL.searchParams.append('response_type', 'code');
      authURL.searchParams.append('redirect_uri', BUNGIE_CONFIG.redirectURI);
      authURL.searchParams.append('state', generatedState);
      
      // Redirect to Bungie OAuth
      window.location.href = authURL.toString();
    } catch (error) {
      logger.error('Failed to initiate OAuth flow', {
        error: error.message,
        stack: error.stack
      });
      
      throw new GuardianError(
        'Failed to start authentication process',
        ERROR_CODES.OAUTH_INITIATION_FAILED,
        { originalError: error.message }
      );
    }
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
   * Recovery method for OAuth state validation failures
   * Cleans up all stored states and provides fresh start
   */
  static recoverFromStateValidationError() {
    try {
      // Import cleanup function
      import('../../utils/errorHandler').then(({ cleanupOAuthState, cleanupExpiredOAuthStates }) => {
        // Clean up all OAuth states
        cleanupOAuthState();
        cleanupExpiredOAuthStates();
        
        // Clear any additional OAuth-related storage
        localStorage.removeItem('oauth_state');
        localStorage.removeItem('oauth_code_verifier');
        sessionStorage.removeItem('bungie_auth_redirect');
        
        logger.info('OAuth state recovery completed - ready for fresh authentication');
      });
      
      return {
        success: true,
        message: 'OAuth state cleared. You can now try connecting again.',
        action: 'retry_authentication'
      };
    } catch (error) {
      logger.error('Failed to recover from OAuth state error', { error: error.message });
      return {
        success: false,
        message: 'Recovery failed. Please refresh the page and try again.',
        error: error.message
      };
    }
  }

  /**
   * Test method to validate OAuth state storage and retrieval
   * @returns {Object} Test results
   */
  static testOAuthStateValidation() {
    console.log('=== OAuth State Validation Test ===');
    
    // Generate test state
    const testState = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    console.log('Generated test state:', testState);
    
    // Clear existing states
    localStorage.removeItem('bungie_oauth_state');
    sessionStorage.removeItem('bungie_oauth_state');
    document.cookie = 'bungie_oauth_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Store test state
    localStorage.setItem('bungie_oauth_state', testState);
    sessionStorage.setItem('bungie_oauth_state', testState);
    document.cookie = `bungie_oauth_state=${testState}; max-age=600; path=/; SameSite=Lax`;
    
    // Retrieve and validate
    const retrievedLocal = localStorage.getItem('bungie_oauth_state');
    const retrievedSession = sessionStorage.getItem('bungie_oauth_state');
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    const retrievedCookie = cookies['bungie_oauth_state'];
    
    const results = {
      testState,
      retrievedLocal,
      retrievedSession,
      retrievedCookie,
      localStorageWorking: retrievedLocal === testState,
      sessionStorageWorking: retrievedSession === testState,
      cookieWorking: retrievedCookie === testState,
      allStorageWorking: retrievedLocal === testState && retrievedSession === testState && retrievedCookie === testState
    };
    
    console.log('OAuth State Test Results:', results);
    return results;
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
      
      // Enhanced debugging with more details
      console.log('OAuth Callback Debug - Full Details:', {
        receivedState: state,
        receivedStateType: typeof state,
        receivedStateLength: state?.length,
        storedStateLocal,
        storedStateLocalType: typeof storedStateLocal,
        storedStateLocalLength: storedStateLocal?.length,
        storedStateSession,
        storedStateSessionType: typeof storedStateSession,
        storedStateSessionLength: storedStateSession?.length,
        storedStateCookie,
        storedStateCookieType: typeof storedStateCookie,
        storedStateCookieLength: storedStateCookie?.length,
        localMatch: state === storedStateLocal,
        sessionMatch: state === storedStateSession,
        cookieMatch: state === storedStateCookie,
        currentURL: window.location.href,
        currentOrigin: window.location.origin,
        redirectURI: BUNGIE_CONFIG.redirectURI,
        allCookies: document.cookie
      });
      
      // Enhanced state validation using the new error handler
      const receivedState = state?.trim();
      
      try {
        const validationResult = validateOAuthState(receivedState, {
          enableFallbacks: true,
          strictMode: false // Allow some flexibility in production
        });
        
        if (!validationResult.isValid) {
          throw new GuardianError(
            'OAuth state validation failed',
            ERROR_CODES.OAUTH_STATE_VALIDATION_FAILED,
            {
              receivedState: receivedState ? receivedState.slice(0, 8) + '...' : 'null',
              matchedSource: validationResult.matchedSource,
              availableSources: validationResult.validationSources
            }
          );
        }
        
        logger.debug('OAuth state validation successful', {
          matchedSource: validationResult.matchedSource,
          availableSources: validationResult.validationSources
        });
        
      } catch (error) {
        if (error instanceof GuardianError) {
          logger.stateValidationError(error.context);
          throw error;
        }
        
        // Handle unexpected validation errors
        logger.stateValidationError({ error: error.message });
        throw new GuardianError(
          `State validation error: ${error.message}`,
          ERROR_CODES.OAUTH_STATE_VALIDATION_FAILED,
          { originalError: error.message }
        );
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
      logger.oauthError('callback processing', error, {
        url: window.location.href,
        hasCode: !!code,
        hasState: !!state
      });
      throw new Error(`Authentication failed: ${error?.message}`);
    }
  }

  /**
   * Exchanges authorization code for access/refresh tokens with enhanced validation
   * @private
   */
  static async exchangeCodeForTokens(code) {
    // Enhanced input validation
    if (!code || typeof code !== 'string') {
      throw new Error('Invalid authorization code: code must be a non-empty string');
    }

    // Validate code format (basic sanity check)
    const trimmedCode = code.trim();
    if (trimmedCode.length < 10 || trimmedCode.length > 500) {
      throw new Error('Invalid authorization code: code length is outside expected range');
    }

    // Validate redirect URI is properly configured
    if (!BUNGIE_CONFIG.redirectURI) {
      throw new Error('OAuth configuration error: redirect URI not configured');
    }

    try {
      logger.info('Initiating token exchange', {
        codeLength: trimmedCode.length,
        redirectURI: BUNGIE_CONFIG.redirectURI,
        endpoint: '/bungie/oauth/token'
      });

      const requestPayload = {
        grant_type: 'authorization_code',
        code: trimmedCode,
        redirect_uri: BUNGIE_CONFIG.redirectURI
      };

      const response = await apiClient.post('/bungie/oauth/token', requestPayload);

      // Enhanced response validation
      if (!response || !response.data) {
        throw new Error('No response received from token exchange API');
      }

      if (!response.data.success) {
        const errorMsg = response.data.message || response.data.error || 'Unknown error';
        throw new Error(`Token exchange rejected: ${errorMsg}`);
      }

      if (!response.data.data) {
        throw new Error('Invalid response format: missing token data');
      }

      // Validate token structure
      const tokenData = response.data.data;
      if (!tokenData.access_token || typeof tokenData.access_token !== 'string') {
        throw new Error('Invalid token response: missing or invalid access_token');
      }

      if (!tokenData.refresh_token || typeof tokenData.refresh_token !== 'string') {
        throw new Error('Invalid token response: missing or invalid refresh_token');
      }

      logger.info('Token exchange successful', {
        hasAccessToken: !!tokenData.access_token,
        hasRefreshToken: !!tokenData.refresh_token,
        expiresIn: tokenData.expires_in
      });

      return tokenData;
    } catch (error) {
      // Enhanced error logging with more context
      const errorContext = {
        hasCode: !!code,
        codeLength: code ? code.length : 0,
        endpoint: '/bungie/oauth/token',
        errorType: error.constructor.name,
        statusCode: error.status || 'unknown'
      };

      // Check for specific 400 error patterns
      if (error.message.includes('400') || error.status === 400) {
        logger.error('Token exchange failed with 400 Bad Request', {
          ...errorContext,
          possibleCauses: [
            'Invalid authorization code format',
            'Expired authorization code',
            'Mismatched redirect URI',
            'Missing required parameters'
          ]
        });
        throw new Error('Token exchange failed: Invalid or expired authorization code');
      }

      if (error.message.includes('401') || error.status === 401) {
        logger.error('Token exchange failed with 401 Unauthorized', errorContext);
        throw new Error('Token exchange failed: Invalid client credentials');
      }

      logger.oauthError('token exchange', error, errorContext);
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
   * Refreshes the access token using the refresh token with enhanced validation and retry logic
   * @returns {Promise<boolean>} True if refresh was successful
   */
  static async refreshAccessToken() {
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        const connection = await this.getBungieConnection();
        
        // Enhanced validation of refresh token
        if (!connection) {
          logger.error('Token refresh failed: No connection data found');
          return false;
        }
        
        if (!connection.refresh_token) {
          logger.error('Token refresh failed: No refresh token available');
          return false;
        }

        // Decrypt and validate refresh token
        let decryptedRefreshToken;
        try {
          decryptedRefreshToken = decryptToken(connection.refresh_token);
          if (!decryptedRefreshToken || typeof decryptedRefreshToken !== 'string') {
            throw new Error('Invalid refresh token format after decryption');
          }
        } catch (decryptError) {
          logger.error('Token refresh failed: Unable to decrypt refresh token', {
            error: decryptError.message,
            attempt: retryCount + 1
          });
          return false;
        }

        logger.info('Initiating token refresh', {
          attempt: retryCount + 1,
          maxRetries: maxRetries + 1,
          hasRefreshToken: !!decryptedRefreshToken
        });

        const requestPayload = {
          grant_type: 'refresh_token',
          refresh_token: decryptedRefreshToken
        };

        const response = await apiClient.post('/bungie/oauth/token', requestPayload);

        // Enhanced response validation
        if (!response || !response.data) {
          throw new Error('No response received from token refresh API');
        }

        if (!response.data.success) {
          const errorMsg = response.data.message || response.data.error || 'Unknown error';
          throw new Error(`Token refresh rejected: ${errorMsg}`);
        }

        if (!response.data.data) {
          throw new Error('Invalid response format: missing token data');
        }

        const newTokens = response.data.data;
        
        // Validate new token structure
        if (!newTokens.access_token || typeof newTokens.access_token !== 'string') {
          throw new Error('Invalid refresh response: missing or invalid access_token');
        }

        const expiresIn = parseInt(newTokens.expires_in) || 3600;
        const expiresAt = new Date(Date.now() + (expiresIn * 1000));

        // Encrypt new tokens before updating in localStorage
        try {
          const encryptedAccessToken = encryptToken(newTokens.access_token);
          const encryptedRefreshToken = newTokens.refresh_token ? 
            encryptToken(newTokens.refresh_token) : 
            connection.refresh_token; // Keep existing if no new refresh token

          const updatedConnection = {
            ...connection,
            access_token: encryptedAccessToken,
            refresh_token: encryptedRefreshToken,
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString()
          };

          localStorage.setItem('bungie_connection', JSON.stringify(updatedConnection));
          
          logger.info('Token refresh successful', {
            expiresAt: expiresAt.toISOString(),
            attempt: retryCount + 1
          });
          
          return true;
        } catch (encryptionError) {
          logger.error('Token encryption failed during refresh', {
            error: encryptionError.message,
            attempt: retryCount + 1
          });
          throw new Error('Failed to securely update tokens');
        }

      } catch (error) {
        retryCount++;
        
        const errorContext = {
          attempt: retryCount,
          maxRetries: maxRetries + 1,
          errorType: error.constructor.name,
          statusCode: error.status || 'unknown'
        };

        // Handle specific error cases
        if (error.message.includes('400') || error.status === 400) {
          logger.error('Token refresh failed with 400 Bad Request', {
            ...errorContext,
            possibleCauses: [
              'Invalid refresh token format',
              'Expired refresh token',
              'Missing required parameters',
              'Token encryption/decryption issues'
            ]
          });
          // Don't retry 400 errors - they indicate invalid tokens
          return false;
        }

        if (error.message.includes('401') || error.status === 401) {
          logger.error('Token refresh failed with 401 Unauthorized', errorContext);
          // Don't retry 401 errors - tokens are invalid
          return false;
        }

        if (retryCount <= maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000); // Exponential backoff
          logger.warn(`Token refresh failed, retrying in ${delay}ms`, errorContext);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          logger.error('Token refresh failed after all retries', {
            ...errorContext,
            finalError: error.message
          });
        }
      }
    }
    
    return false;
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