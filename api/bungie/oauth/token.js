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
    const { code, refresh_token, redirect_uri, grant_type = 'authorization_code' } = req.body;

    // Enhanced validation of environment variables
    const requiredEnvVars = {
      BUNGIE_CLIENT_ID: process.env.BUNGIE_CLIENT_ID,
      BUNGIE_CLIENT_SECRET: process.env.BUNGIE_CLIENT_SECRET,
      BUNGIE_REDIRECT_URI: process.env.BUNGIE_REDIRECT_URI
    };

    const missingEnvVars = Object.entries(requiredEnvVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingEnvVars.length > 0) {
      console.error('Missing required environment variables:', missingEnvVars);
      return res.status(500).json({
        success: false,
        error: 'Server configuration error: Missing required environment variables',
        details: { missingVars: missingEnvVars }
      });
    }

    // Enhanced grant type validation
    const validGrantTypes = ['authorization_code', 'refresh_token'];
    if (!validGrantTypes.includes(grant_type)) {
      console.error('Invalid grant_type provided:', {
        provided: grant_type,
        valid: validGrantTypes
      });
      return res.status(400).json({
        success: false,
        error: 'Invalid grant_type',
        details: {
          provided: grant_type,
          valid: validGrantTypes
        }
      });
    }

    let formData;
    
    if (grant_type === 'authorization_code') {
      if (!code) {
        console.error('Missing authorization code for authorization_code grant');
        return res.status(400).json({
          success: false,
          error: 'Authorization code is required for authorization_code grant',
          details: {
            grant_type,
            missing_parameter: 'code'
          }
        });
      }

      // Validate authorization code format (should be a reasonable length string)
      if (typeof code !== 'string' || code.length < 10 || code.length > 500) {
        console.error('Invalid authorization code format:', {
          codeType: typeof code,
          codeLength: code ? code.length : 0
        });
        return res.status(400).json({
          success: false,
          error: 'Invalid authorization code format',
          details: {
            expected: 'String between 10-500 characters',
            received: `${typeof code} of length ${code ? code.length : 0}`
          }
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

      const redirectUri = redirect_uri || process.env.BUNGIE_REDIRECT_URI;
      if (!redirectUri) {
        console.error('Missing redirect_uri for authorization_code grant');
        return res.status(400).json({
          success: false,
          error: 'Redirect URI is required for authorization_code grant'
        });
      }

      formData = new URLSearchParams({
        grant_type,
        code: sanitizedCode,
        redirect_uri: redirectUri,
        client_id: BUNGIE_CONFIG.clientId,
        client_secret: BUNGIE_CONFIG.clientSecret
      });
    } else if (grant_type === 'refresh_token') {
      if (!refresh_token) {
        console.error('Missing refresh_token for refresh_token grant');
        return res.status(400).json({
          success: false,
          error: 'Refresh token is required for refresh_token grant',
          details: {
            grant_type,
            missing_parameter: 'refresh_token'
          }
        });
      }

      // Validate refresh token format
      if (typeof refresh_token !== 'string' || refresh_token.length < 20) {
        console.error('Invalid refresh_token format:', {
          tokenType: typeof refresh_token,
          tokenLength: refresh_token ? refresh_token.length : 0
        });
        return res.status(400).json({
          success: false,
          error: 'Invalid refresh token format',
          details: {
            expected: 'String with minimum 20 characters',
            received: `${typeof refresh_token} of length ${refresh_token ? refresh_token.length : 0}`
          }
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

    console.log('Token exchange request initiated:', {
      grant_type,
      has_code: !!code,
      has_refresh_token: !!refresh_token,
      redirect_uri: redirect_uri || process.env.BUNGIE_REDIRECT_URI,
      client_id_present: !!process.env.BUNGIE_CLIENT_ID,
      timestamp: new Date().toISOString()
    });

    // Make request to Bungie's token endpoint with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const tokenResponse = await fetch(BUNGIE_CONFIG.tokenURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-API-Key': BUNGIE_CONFIG.apiKey,
        'User-Agent': 'Guardian-Nexus/1.0',
        'Accept': 'application/json'
      },
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Enhanced error handling for different response codes
    if (!tokenResponse.ok) {
      let errorText = '';
      let errorData = {};
      
      try {
        errorText = await tokenResponse.text();
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
      } catch (readError) {
        console.error('Failed to read error response:', readError.message);
        errorData = { message: 'Unable to read error response' };
      }

      const errorContext = {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        grant_type,
        has_code: !!code,
        has_refresh_token: !!refresh_token,
        errorData,
        timestamp: new Date().toISOString()
      };

      console.error('Bungie token exchange failed:', errorContext);

      // Handle specific error cases
      if (tokenResponse.status === 400) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request: Invalid token exchange parameters',
          details: {
            bungieError: errorData,
            possibleCauses: [
              'Invalid or expired authorization code',
              'Invalid refresh token',
              'Incorrect redirect_uri',
              'Invalid client credentials',
              'Malformed request parameters'
            ]
          }
        });
      }

      if (tokenResponse.status === 401) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: Invalid client credentials',
          details: {
            bungieError: errorData,
            suggestion: 'Verify BUNGIE_CLIENT_ID and BUNGIE_CLIENT_SECRET configuration'
          }
        });
      }
      
      throw new Error(`Token exchange failed: ${tokenResponse.status} ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    
    console.log('Token exchange response received:', {
      has_access_token: !!tokenData.access_token,
      has_refresh_token: !!tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
      timestamp: new Date().toISOString()
    });

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