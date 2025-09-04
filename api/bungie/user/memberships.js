// Vercel serverless function for Bungie user memberships
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
  timeout: 10000
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

  try {
    // Get user memberships from Bungie API
    const response = await bungieAPI.get('/User/GetMembershipsForCurrentUser/', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const membershipData = response.data;

    if (membershipData.ErrorCode !== 1) {
      throw new Error(`Bungie API Error: ${membershipData.Message}`);
    }

    // Return memberships with CORS headers
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
      .setHeader('Access-Control-Allow-Credentials', corsHeaders['Access-Control-Allow-Credentials'])
      .json({
        success: true,
        data: membershipData.Response
      });

  } catch (error) {
    console.error('User memberships fetch error:', error.response?.data || error.message);
    
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
          message: 'Insufficient permissions to access user memberships'
        });
    }

    // Generic error response
    return res.status(500)
      .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
      .json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch user memberships'
      });
  }
}