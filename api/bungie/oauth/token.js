// Vercel serverless function for Bungie OAuth token exchange

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
    const { code, refresh_token, grant_type = 'authorization_code' } = req.body;

    // Validate grant type
    if (typeof grant_type !== 'string' || !['authorization_code', 'refresh_token'].includes(grant_type)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid grant type. Must be authorization_code or refresh_token'
      });
    }

    let formData;
    
    if (grant_type === 'authorization_code') {
      // Input validation and sanitization for authorization code
      if (!code || typeof code !== 'string') {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Valid authorization code is required'
        });
      }

      // Sanitize code parameter (remove any potential injection attempts)
      const sanitizedCode = code.trim().replace(/[^a-zA-Z0-9\-_]/g, '');
      
      if (sanitizedCode.length < 10 || sanitizedCode.length > 500) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid authorization code format'
        });
      }

      formData = new URLSearchParams({
        grant_type,
        code: sanitizedCode,
        client_id: BUNGIE_CONFIG.clientId,
        client_secret: BUNGIE_CONFIG.clientSecret
      });
    } else if (grant_type === 'refresh_token') {
      // Input validation and sanitization for refresh token
      if (!refresh_token || typeof refresh_token !== 'string') {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Valid refresh token is required'
        });
      }

      // Sanitize refresh token
      const sanitizedRefreshToken = refresh_token.trim();
      
      if (sanitizedRefreshToken.length < 10 || sanitizedRefreshToken.length > 1000) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid refresh token format'
        });
      }

      formData = new URLSearchParams({
        grant_type,
        refresh_token: sanitizedRefreshToken,
        client_id: BUNGIE_CONFIG.clientId,
        client_secret: BUNGIE_CONFIG.clientSecret
      });
    }

    const tokenResponse = await fetch(BUNGIE_CONFIG.tokenURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-API-Key': BUNGIE_CONFIG.apiKey
      },
      body: formData
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      throw new Error(`Token exchange failed: ${tokenResponse.status} ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();

    // Validate and sanitize token response
    if (!tokenData.access_token || typeof tokenData.access_token !== 'string') {
      throw new Error('Invalid token response from Bungie API');
    }

    // Validate token format (basic JWT structure check)
    const tokenParts = tokenData.access_token.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Invalid access token format');
    }

    // Sanitize and validate response data
    const sanitizedTokenData = {
      access_token: tokenData.access_token.trim(),
      token_type: (tokenData.token_type || 'Bearer').trim(),
      expires_in: parseInt(tokenData.expires_in) || 3600,
      refresh_token: tokenData.refresh_token ? tokenData.refresh_token.trim() : null,
      refresh_expires_in: parseInt(tokenData.refresh_expires_in) || 7776000,
      membership_id: tokenData.membership_id ? String(tokenData.membership_id).trim() : null
    };

    // Additional validation
    if (sanitizedTokenData.expires_in < 60 || sanitizedTokenData.expires_in > 86400) {
      sanitizedTokenData.expires_in = 3600; // Default to 1 hour
    }

    // Return token data with CORS headers
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
      .setHeader('Access-Control-Allow-Credentials', corsHeaders['Access-Control-Allow-Credentials'])
      .json({
        success: true,
        data: sanitizedTokenData
      });

  } catch (error) {
    // Log security-relevant errors (without sensitive data)
    console.error('OAuth token exchange error:', {
      message: error.message,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    });
    
    // Handle specific error cases
    if (error.message.includes('400') || error.message.includes('Invalid')) {
      return res.status(400)
        .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
        .json({
          error: 'Invalid authorization code',
          message: 'The provided authorization code is invalid or expired'
        });
    }

    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return res.status(401)
        .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
        .json({
          error: 'Unauthorized',
          message: 'Invalid client credentials'
        });
    }

    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return res.status(403)
        .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
        .json({
          error: 'Forbidden',
          message: 'Access denied by Bungie API'
        });
    }

    // Generic error response (don't expose internal errors in production)
    return res.status(500)
      .setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
      .json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Token exchange failed. Please try again.'
      });
  }
}