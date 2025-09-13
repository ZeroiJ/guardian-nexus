/**
 * OAuth Token Exchange Endpoint
 * Handles Bungie OAuth authorization code exchange for access tokens
 */

const { applyCorsHeaders, handleCorsPrelight, validateEnvironment, createSuccessResponse } = require('../utils/bungie-client');
const { withErrorHandler, createValidationError } = require('../utils/error-handler');

/**
 * Exchange authorization code for access token
 * @param {string} code - Authorization code from Bungie OAuth
 * @param {string} redirectUri - Redirect URI used in OAuth flow
 * @returns {Promise<Object>} Token response from Bungie API
 */
async function exchangeCodeForToken(code, redirectUri) {
  const tokenUrl = 'https://www.bungie.net/platform/app/oauth/token/';
  
  // Validate client credentials before making request
  const clientId = process.env.BUNGIE_CLIENT_ID;
  const clientSecret = process.env.BUNGIE_CLIENT_SECRET;
  
  if (!clientId || clientId.trim() === '') {
    throw new Error('BUNGIE_CLIENT_ID is not properly configured');
  }
  
  if (!clientSecret || clientSecret.trim() === '') {
    throw new Error('BUNGIE_CLIENT_SECRET is not properly configured');
  }
  
  const tokenData = {
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId.trim(),
    client_secret: clientSecret.trim()
  };

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-API-Key': process.env.BUNGIE_API_KEY
    },
    body: new URLSearchParams(tokenData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
  }

  return await response.json();
}

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New token response
 */
async function refreshAccessToken(refreshToken) {
  const tokenUrl = 'https://www.bungie.net/platform/app/oauth/token/';
  
  // Validate client credentials before making request
  const clientId = process.env.BUNGIE_CLIENT_ID;
  const clientSecret = process.env.BUNGIE_CLIENT_SECRET;
  
  if (!clientId || clientId.trim() === '') {
    throw new Error('BUNGIE_CLIENT_ID is not properly configured');
  }
  
  if (!clientSecret || clientSecret.trim() === '') {
    throw new Error('BUNGIE_CLIENT_SECRET is not properly configured');
  }
  
  const tokenData = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId.trim(),
    client_secret: clientSecret.trim()
  };

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-API-Key': process.env.BUNGIE_API_KEY
    },
    body: new URLSearchParams(tokenData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token refresh failed: ${response.status} ${errorText}`);
  }

  return await response.json();
}

/**
 * Main handler for token endpoint
 * @param {Object} req - Vercel request object
 * @param {Object} res - Vercel response object
 * @returns {Object} Token response or error
 */
async function handler(req, res) {
  // Setup CORS
  applyCorsHeaders(res);
  
  // Handle preflight requests
  const corsResponse = handleCorsPrelight(req, res);
  if (corsResponse) {
    return corsResponse;
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    throw createValidationError('Method not allowed. Use POST.', { allowedMethods: ['POST'] });
  }
  
  // Validate environment variables
  const envValidation = validateEnvironment();
  if (!envValidation.isValid) {
    throw createValidationError(
      `Missing required environment variables: ${envValidation.missing.join(', ')}`,
      { missingVariables: envValidation.missing }
    );
  }
  
  // Additional client_id validation
  if (!process.env.BUNGIE_CLIENT_ID || process.env.BUNGIE_CLIENT_ID.trim() === '') {
    throw createValidationError('BUNGIE_CLIENT_ID is not properly configured');
  }
  
  // Parse request body
  const { code, refresh_token, redirect_uri, grant_type } = req.body;
  
  // Validate grant type
  if (!grant_type || !['authorization_code', 'refresh_token'].includes(grant_type)) {
    throw createValidationError('Invalid grant_type. Must be "authorization_code" or "refresh_token".');
  }
  
  let tokenResponse;
  
  try {
    if (grant_type === 'authorization_code') {
      // Validate required parameters for authorization code flow
      if (!code) {
        throw createValidationError('Missing required parameter: code');
      }
      if (!redirect_uri) {
        throw createValidationError('Missing required parameter: redirect_uri');
      }
      
      tokenResponse = await exchangeCodeForToken(code, redirect_uri);
    } else if (grant_type === 'refresh_token') {
      // Validate required parameters for refresh token flow
      if (!refresh_token) {
        throw createValidationError('Missing required parameter: refresh_token');
      }
      
      tokenResponse = await refreshAccessToken(refresh_token);
    }
    
    // Return successful token response
    return createSuccessResponse(res, {
      access_token: tokenResponse.access_token,
      token_type: tokenResponse.token_type || 'Bearer',
      expires_in: tokenResponse.expires_in,
      refresh_token: tokenResponse.refresh_token,
      refresh_expires_in: tokenResponse.refresh_expires_in,
      membership_id: tokenResponse.membership_id
    }, 'Token exchange successful');
    
  } catch (error) {
    // Re-throw to be handled by error handler
    throw error;
  }
}

// Export handler wrapped with error handling
module.exports = withErrorHandler(handler);