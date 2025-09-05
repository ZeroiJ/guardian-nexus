// Debug version of manifest endpoint

// Bungie API configuration
const BUNGIE_CONFIG = {
  apiKey: process.env.BUNGIE_API_KEY,
  baseURL: 'https://www.bungie.net/Platform'
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Helper function to make Bungie API requests using fetch
async function fetchBungieAPI(endpoint) {
  const url = `${BUNGIE_CONFIG.baseURL}${endpoint}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-API-Key': BUNGIE_CONFIG.apiKey,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
      .setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods'])
      .setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers'])
      .end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Debug info
    const debugInfo = {
      apiKeyExists: !!BUNGIE_CONFIG.apiKey,
      apiKeyLength: BUNGIE_CONFIG.apiKey ? BUNGIE_CONFIG.apiKey.length : 0,
      baseURL: BUNGIE_CONFIG.baseURL,
      timestamp: new Date().toISOString()
    };

    // Validate API key
    if (!BUNGIE_CONFIG.apiKey) {
      return res.status(500)
        .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
        .json({
          error: 'Server configuration error',
          message: 'Bungie API key not configured',
          debug: debugInfo
        });
    }

    // Make the API call
    console.log('Making Bungie API call to:', BUNGIE_CONFIG.baseURL + '/Destiny2/Manifest/');
    const manifestData = await fetchBungieAPI('/Destiny2/Manifest/');

    console.log('Bungie API response ErrorCode:', manifestData.ErrorCode);

    if (manifestData.ErrorCode !== 1) {
      return res.status(400)
        .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
        .json({
          error: 'Bungie API Error',
          message: manifestData.Message,
          errorCode: manifestData.ErrorCode,
          debug: debugInfo
        });
    }

    // Success response
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
      .json({
        success: true,
        data: manifestData.Response,
        debug: debugInfo
      });

  } catch (error) {
    console.error('Manifest debug endpoint error:', error);
    
    const errorResponse = {
      error: 'Internal server error',
      message: error.message,
      debug: {
        apiKeyExists: !!BUNGIE_CONFIG.apiKey,
        apiKeyLength: BUNGIE_CONFIG.apiKey ? BUNGIE_CONFIG.apiKey.length : 0,
        baseURL: BUNGIE_CONFIG.baseURL,
        errorType: error.constructor.name,
        timestamp: new Date().toISOString()
      }
    };

    // Add more error details if available
    if (error.message) {
      errorResponse.debug.errorMessage = error.message;
    }

    if (error.cause) {
      errorResponse.debug.errorCause = error.cause;
    }

    return res.status(500)
      .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
      .json(errorResponse);
  }
}