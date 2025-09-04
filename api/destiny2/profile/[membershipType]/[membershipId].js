// Vercel serverless function for Destiny 2 profile data
const axios = require('axios');

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

// Axios instance for Bungie API
const bungieAPI = axios.create({
  baseURL: BUNGIE_CONFIG.baseURL,
  headers: {
    'X-API-Key': BUNGIE_CONFIG.apiKey,
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

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

  // Extract and validate access token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401)
      .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
      .json({
        error: 'Unauthorized',
        message: 'Valid access token required'
      });
  }

  const accessToken = authHeader.substring(7);
  const { membershipType, membershipId } = req.query;
  const { components = '100,200,201,202,205,300,301,302,303,304,305,306,307,308,309,310' } = req.query;

  // Validate required parameters
  if (!membershipType || !membershipId) {
    return res.status(400)
      .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
      .json({
        error: 'Bad Request',
        message: 'membershipType and membershipId are required'
      });
  }

  try {
    // Get Destiny 2 profile from Bungie API
    const response = await bungieAPI.get(
      `/Destiny2/${membershipType}/Profile/${membershipId}/`,
      {
        params: { components },
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const profileData = response.data;

    if (profileData.ErrorCode !== 1) {
      throw new Error(`Bungie API Error: ${profileData.Message}`);
    }

    // Return profile data with CORS headers
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
      .setHeader('Access-Control-Allow-Credentials', corsHeaders['Access-Control-Allow-Credentials'])
      .json({
        success: true,
        data: profileData.Response
      });

  } catch (error) {
    console.error('Destiny 2 profile fetch error:', error.response?.data || error.message);
    
    // Handle specific Bungie API errors
    if (error.response?.status === 401) {
      return res.status(401)
        .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
        .json({
          error: 'Unauthorized',
          message: 'Invalid or expired access token'
        });
    }

    if (error.response?.status === 403) {
      return res.status(403)
        .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
        .json({
          error: 'Forbidden',
          message: 'Insufficient permissions or privacy settings prevent access'
        });
    }

    if (error.response?.status === 404) {
      return res.status(404)
        .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
        .json({
          error: 'Not Found',
          message: 'Profile not found or does not exist'
        });
    }

    // Generic error response
    return res.status(500)
      .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
      .json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch Destiny 2 profile'
      });
  }
}