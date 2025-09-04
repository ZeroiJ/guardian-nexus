// Vercel serverless function for Bungie OAuth token exchange
const axios = require('axios');

// Bungie API configuration
const BUNGIE_CONFIG = {
  apiKey: process.env.BUNGIE_API_KEY,
  clientId: process.env.BUNGIE_CLIENT_ID,
  clientSecret: process.env.BUNGIE_CLIENT_SECRET,
  tokenURL: 'https://www.bungie.net/platform/app/oauth/token/'
};

// CORS headers for Vercel
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || '*'
    : '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true'
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
      .setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods'])
      .setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers'])
      .setHeader('Access-Control-Allow-Credentials', corsHeaders['Access-Control-Allow-Credentials'])
      .end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate environment variables
  if (!BUNGIE_CONFIG.apiKey || !BUNGIE_CONFIG.clientId || !BUNGIE_CONFIG.clientSecret) {
    console.error('Missing Bungie API configuration');
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'Bungie API credentials not configured'
    });
  }

  try {
    const { code, grant_type = 'authorization_code' } = req.body;

    if (!code) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Authorization code is required'
      });
    }

    // Exchange authorization code for access token
    const tokenResponse = await axios.post(BUNGIE_CONFIG.tokenURL, {
      grant_type,
      code,
      client_id: BUNGIE_CONFIG.clientId,
      client_secret: BUNGIE_CONFIG.clientSecret
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-API-Key': BUNGIE_CONFIG.apiKey
      },
      timeout: 10000
    });

    const tokenData = tokenResponse.data;

    // Validate token response
    if (!tokenData.access_token) {
      throw new Error('Invalid token response from Bungie API');
    }

    // Return token data with CORS headers
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
      .setHeader('Access-Control-Allow-Credentials', corsHeaders['Access-Control-Allow-Credentials'])
      .json({
        success: true,
        data: {
          access_token: tokenData.access_token,
          token_type: tokenData.token_type || 'Bearer',
          expires_in: tokenData.expires_in,
          refresh_token: tokenData.refresh_token,
          refresh_expires_in: tokenData.refresh_expires_in,
          membership_id: tokenData.membership_id
        }
      });

  } catch (error) {
    console.error('OAuth token exchange error:', error.response?.data || error.message);
    
    // Handle Bungie API errors
    if (error.response?.status === 400) {
      return res.status(400)
        .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
        .json({
          error: 'Invalid authorization code',
          message: 'The provided authorization code is invalid or expired'
        });
    }

    if (error.response?.status === 401) {
      return res.status(401)
        .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
        .json({
          error: 'Authentication failed',
          message: 'Invalid client credentials'
        });
    }

    // Generic error response
    return res.status(500)
      .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
      .json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Token exchange failed'
      });
  }
}