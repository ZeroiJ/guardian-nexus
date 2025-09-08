/**
 * Centralized Bungie API Client for Vercel Serverless Functions
 * Provides consistent API communication, error handling, and configuration
 */

// Bungie API Configuration
const BUNGIE_CONFIG = {
  apiKey: process.env.BUNGIE_API_KEY,
  clientId: process.env.BUNGIE_CLIENT_ID,
  clientSecret: process.env.BUNGIE_CLIENT_SECRET,
  baseURL: 'https://www.bungie.net/Platform',
  tokenURL: 'https://www.bungie.net/platform/app/oauth/token/',
  authURL: 'https://www.bungie.net/en/oauth/authorize'
};

// CORS headers for all responses
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://guardian-nexus.vercel.app'
    : '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json'
};

/**
 * Apply CORS headers to response
 * @param {Object} res - Vercel response object
 * @returns {Object} Response object with CORS headers
 */
function applyCorsHeaders(res) {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  return res;
}

/**
 * Handle CORS preflight requests
 * @param {Object} req - Vercel request object
 * @param {Object} res - Vercel response object
 * @returns {Object} Response for OPTIONS requests
 */
function handleCorsPrelight(req, res) {
  if (req.method === 'OPTIONS') {
    return applyCorsHeaders(res).status(200).end();
  }
  return null;
}

/**
 * Validate required environment variables
 * @returns {Object} Validation result with success flag and missing vars
 */
function validateEnvironment() {
  const required = {
    BUNGIE_API_KEY: process.env.BUNGIE_API_KEY,
    BUNGIE_CLIENT_ID: process.env.BUNGIE_CLIENT_ID,
    BUNGIE_CLIENT_SECRET: process.env.BUNGIE_CLIENT_SECRET
  };

  const missing = Object.entries(required)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  return {
    isValid: missing.length === 0,
    missing,
    config: required
  };
}

/**
 * Create authenticated request headers for Bungie API
 * @param {string} accessToken - Optional OAuth access token
 * @returns {Object} Headers object
 */
function createBungieHeaders(accessToken = null) {
  const headers = {
    'X-API-Key': BUNGIE_CONFIG.apiKey,
    'Content-Type': 'application/json',
    'User-Agent': 'Guardian-Nexus/1.0'
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

/**
 * Make authenticated request to Bungie API
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Request options
 * @param {string} options.method - HTTP method (default: 'GET')
 * @param {Object} options.body - Request body for POST requests
 * @param {string} options.accessToken - OAuth access token
 * @returns {Promise<Object>} API response data
 */
async function makeBungieRequest(endpoint, options = {}) {
  const { method = 'GET', body, accessToken } = options;
  
  const url = endpoint.startsWith('http') ? endpoint : `${BUNGIE_CONFIG.baseURL}${endpoint}`;
  const headers = createBungieHeaders(accessToken);

  const requestConfig = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) })
  };

  try {
    const response = await fetch(url, requestConfig);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Bungie API Error: ${response.status} - ${data.Message || 'Unknown error'}`);
    }

    // Check Bungie API response format
    if (data.ErrorCode && data.ErrorCode !== 1) {
      throw new Error(`Bungie API Error: ${data.ErrorStatus} - ${data.Message}`);
    }

    return data;
  } catch (error) {
    console.error('Bungie API Request Failed:', {
      endpoint,
      method,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

/**
 * Extract and validate access token from request
 * @param {Object} req - Vercel request object
 * @returns {string|null} Access token or null if invalid
 */
function extractAccessToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

/**
 * Create standardized error response
 * @param {Object} res - Vercel response object
 * @param {number} status - HTTP status code
 * @param {string} error - Error type
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {Object} Error response
 */
function createErrorResponse(res, status, error, message, details = {}) {
  return applyCorsHeaders(res).status(status).json({
    error,
    message,
    timestamp: new Date().toISOString(),
    ...details
  });
}

/**
 * Create standardized success response
 * @param {Object} res - Vercel response object
 * @param {Object} data - Response data
 * @param {Object} meta - Optional metadata
 * @returns {Object} Success response
 */
function createSuccessResponse(res, data, meta = {}) {
  return applyCorsHeaders(res).status(200).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    ...meta
  });
}

module.exports = {
  BUNGIE_CONFIG,
  CORS_HEADERS,
  applyCorsHeaders,
  handleCorsPrelight,
  validateEnvironment,
  createBungieHeaders,
  makeBungieRequest,
  extractAccessToken,
  createErrorResponse,
  createSuccessResponse
};