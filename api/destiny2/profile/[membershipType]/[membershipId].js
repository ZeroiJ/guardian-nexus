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

  const { membershipType, membershipId } = req.query;
  const { components = '100,200,201,202,205,300,301,302,303,304,305,306,307,308,309,310' } = req.query;

  // Enhanced parameter validation
  if (!membershipType || !membershipId) {
    console.error('Profile API validation failed:', {
      membershipType: membershipType || 'missing',
      membershipId: membershipId || 'missing',
      query: req.query,
      headers: Object.keys(req.headers)
    });
    return res.status(400)
      .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
      .json({
        error: 'Bad Request',
        message: 'membershipType and membershipId are required',
        details: {
          membershipType: !membershipType ? 'required' : 'provided',
          membershipId: !membershipId ? 'required' : 'provided'
        }
      });
  }

  // Validate membershipType format (should be 1-5 for different platforms)
  const membershipTypeNum = parseInt(membershipType);
  if (isNaN(membershipTypeNum) || membershipTypeNum < 1 || membershipTypeNum > 5) {
    console.error('Invalid membershipType format:', {
      provided: membershipType,
      expected: 'integer between 1-5'
    });
    return res.status(400)
      .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
      .json({
        error: 'Bad Request',
        message: 'Invalid membershipType format',
        details: {
          provided: membershipType,
          expected: 'integer between 1-5 (1=Xbox, 2=PSN, 3=Steam, 4=Blizzard, 5=Stadia)'
        }
      });
  }

  // Validate membershipId format (should be numeric string)
  if (!/^\d+$/.test(membershipId)) {
    console.error('Invalid membershipId format:', {
      provided: membershipId,
      expected: 'numeric string'
    });
    return res.status(400)
      .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
      .json({
        error: 'Bad Request',
        message: 'Invalid membershipId format',
        details: {
          provided: membershipId,
          expected: 'numeric string'
        }
      });
  }

  // Extract and validate access token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('Missing or invalid authorization header:', {
      hasAuthHeader: !!authHeader,
      headerFormat: authHeader ? authHeader.substring(0, 20) + '...' : 'none'
    });
    return res.status(401)
      .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
      .json({
        error: 'Unauthorized',
        message: 'Valid access token required',
        details: {
          expected: 'Bearer <access_token>',
          received: authHeader ? 'invalid format' : 'missing'
        }
      });
  }

  const accessToken = authHeader.substring(7);
  
  // Validate access token format (should be a JWT-like string)
  if (!accessToken || accessToken.length < 50 || !accessToken.includes('.')) {
    console.error('Invalid access token format:', {
      hasToken: !!accessToken,
      tokenLength: accessToken ? accessToken.length : 0,
      hasJWTStructure: accessToken ? accessToken.includes('.') : false
    });
    return res.status(401)
      .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
      .json({
        error: 'Unauthorized',
        message: 'Invalid access token format',
        details: {
          expected: 'Valid JWT access token',
          issue: 'Token appears to be malformed or corrupted'
        }
      });
  }

  try {
    // Validate and sanitize components parameter
    let validatedComponents = components;
    
    // Ensure components is a valid comma-separated list of numbers
    const componentArray = components.split(',').map(c => c.trim());
    const validComponents = componentArray.filter(c => /^\d+$/.test(c));
    
    if (validComponents.length === 0) {
      console.warn('Invalid components parameter, using defaults:', {
        provided: components,
        using: '100,200,201,202,205'
      });
      validatedComponents = '100,200,201,202,205';
    } else {
      validatedComponents = validComponents.join(',');
    }
    
    console.info('Profile API request initiated:', {
      membershipType,
      membershipId,
      components: validatedComponents,
      tokenLength: accessToken.length
    });

    // Get Destiny 2 profile from Bungie API
    const response = await bungieAPI.get(
      `/Destiny2/${membershipType}/Profile/${membershipId}/`,
      {
        params: { components: validatedComponents },
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
    
    // Handle specific Bungie API errors with enhanced logging
    if (error.response?.status === 400) {
      const errorData = error.response?.data;
      console.error('Bungie API returned 400 Bad Request:', {
        membershipType,
        membershipId,
        components: validatedComponents,
        errorData,
        possibleCauses: [
          'Invalid membershipType or membershipId combination',
          'Malformed components parameter',
          'Invalid API request format'
        ]
      });
      return res.status(400)
        .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
        .json({
          error: 'Bad Request',
          message: 'Invalid request parameters for Bungie API',
          details: {
            bungieResponse: errorData,
            membershipType,
            membershipId,
            components: validatedComponents
          }
        });
    }

    if (error.response?.status === 401) {
      console.error('Bungie API authentication failed:', {
        membershipType,
        membershipId,
        tokenLength: accessToken.length,
        possibleCauses: [
          'Expired access token',
          'Invalid access token',
          'Token not properly formatted'
        ]
      });
      return res.status(401)
        .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
        .json({
          error: 'Unauthorized',
          message: 'Invalid or expired access token',
          details: {
            suggestion: 'Please refresh your authentication tokens'
          }
        });
    }

    if (error.response?.status === 403) {
      console.error('Bungie API access forbidden:', {
        membershipType,
        membershipId,
        apiKeyPresent: !!BUNGIE_CONFIG.apiKey,
        possibleCauses: [
          'Invalid API key',
          'Insufficient permissions',
          'Rate limiting',
          'Account privacy settings'
        ]
      });
      return res.status(403)
        .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
        .json({
          error: 'Forbidden',
          message: 'Insufficient permissions or privacy settings prevent access',
          details: {
            suggestion: 'Verify API key configuration and account privacy settings'
          }
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