// Vercel serverless function for Destiny 2 manifest info

// Bungie API configuration
const BUNGIE_CONFIG = {
  apiKey: process.env.BUNGIE_API_KEY,
  baseURL: 'https://www.bungie.net/Platform'
};

// CORS headers for Vercel
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || '*'
    : '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true'
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
      .setHeader('Access-Control-Allow-Credentials', corsHeaders['Access-Control-Allow-Credentials'])
      .end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate API key
  if (!BUNGIE_CONFIG.apiKey) {
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'Bungie API key not configured'
    });
  }

  try {
    // Get manifest info from Bungie API
    const manifestData = await fetchBungieAPI('/Destiny2/Manifest/');

    if (manifestData.ErrorCode !== 1) {
      throw new Error(`Bungie API Error: ${manifestData.Message}`);
    }

    const manifestInfo = manifestData.Response;

    // Return manifest info with CORS headers
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
      .setHeader('Access-Control-Allow-Credentials', corsHeaders['Access-Control-Allow-Credentials'])
      .json({
        success: true,
        data: {
          version: manifestInfo.version,
          mobileAssetContentPath: manifestInfo.mobileAssetContentPath,
          mobileGearAssetDataBases: manifestInfo.mobileGearAssetDataBases,
          mobileWorldContentPaths: manifestInfo.mobileWorldContentPaths,
          jsonWorldContentPaths: manifestInfo.jsonWorldContentPaths,
          jsonWorldComponentContentPaths: manifestInfo.jsonWorldComponentContentPaths,
          mobileClanBannerDatabasePath: manifestInfo.mobileClanBannerDatabasePath,
          mobileGearCDN: manifestInfo.mobileGearCDN,
          iconImagePyramidInfo: manifestInfo.iconImagePyramidInfo
        },
        metadata: {
          cached: false,
          timestamp: new Date().toISOString(),
          source: 'bungie_api'
        }
      });

  } catch (error) {
    console.error('Manifest info fetch error:', error.response?.data || error.message);
    
    // Handle specific errors
    if (error.response?.status === 503) {
      return res.status(503)
        .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
        .json({
          error: 'Service Unavailable',
          message: 'Bungie API is currently unavailable. Please try again later.'
        });
    }

    if (error.response?.status === 429) {
      return res.status(429)
        .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
        .json({
          error: 'Rate Limited',
          message: 'Too many requests. Please wait before trying again.'
        });
    }

    // Generic error response
    return res.status(500)
      .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
      .json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch manifest info'
      });
  }
}