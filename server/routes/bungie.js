const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Bungie API configuration
const BUNGIE_CONFIG = {
  apiKey: process.env.BUNGIE_API_KEY,
  clientId: process.env.BUNGIE_CLIENT_ID,
  clientSecret: process.env.BUNGIE_CLIENT_SECRET,
  baseURL: 'https://www.bungie.net/Platform',
  tokenURL: 'https://www.bungie.net/platform/app/oauth/token/'
};

// Bungie API rate limiting (more restrictive)
const bungieRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 25, // 25 requests per minute per IP
  message: {
    error: 'Bungie API rate limit exceeded. Please wait before making more requests.'
  }
});

router.use(bungieRateLimit);

// Axios instance for Bungie API
const bungieAPI = axios.create({
  baseURL: BUNGIE_CONFIG.baseURL,
  headers: {
    'X-API-Key': BUNGIE_CONFIG.apiKey,
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Middleware to validate API key
const validateApiKey = (req, res, next) => {
  if (!BUNGIE_CONFIG.apiKey) {
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'Bungie API key not configured'
    });
  }
  next();
};

// Middleware to extract and validate access token
const validateAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Valid access token required'
    });
  }
  
  req.accessToken = authHeader.substring(7);
  next();
};

// OAuth token exchange endpoint
router.post('/oauth/token', validateApiKey, async (req, res) => {
  try {
    const { grant_type, code, refresh_token, redirect_uri } = req.body;
    
    if (!grant_type) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'grant_type is required'
      });
    }

    const tokenData = new URLSearchParams({
      grant_type,
      client_id: BUNGIE_CONFIG.clientId,
      client_secret: BUNGIE_CONFIG.clientSecret
    });

    if (grant_type === 'authorization_code') {
      if (!code || !redirect_uri) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'code and redirect_uri are required for authorization_code grant'
        });
      }
      tokenData.append('code', code);
      tokenData.append('redirect_uri', redirect_uri);
    } else if (grant_type === 'refresh_token') {
      if (!refresh_token) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'refresh_token is required for refresh_token grant'
        });
      }
      tokenData.append('refresh_token', refresh_token);
    } else {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Unsupported grant_type'
      });
    }

    const response = await axios.post(BUNGIE_CONFIG.tokenURL, tokenData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-API-Key': BUNGIE_CONFIG.apiKey
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('OAuth token exchange error:', error.response?.data || error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: 'OAuth Error',
        message: error.response.data?.error_description || 'Token exchange failed'
      });
    } else {
      res.status(500).json({
        error: 'Server Error',
        message: 'Failed to exchange token'
      });
    }
  }
});

// Get current user profile
router.get('/user/profile', validateApiKey, validateAccessToken, async (req, res) => {
  try {
    const response = await bungieAPI.get('/User/GetCurrentBungieNetUser/', {
      headers: {
        'Authorization': `Bearer ${req.accessToken}`
      }
    });

    if (response.data.ErrorCode !== 1) {
      return res.status(400).json({
        error: 'Bungie API Error',
        message: response.data.Message,
        errorCode: response.data.ErrorCode
      });
    }

    res.json(response.data.Response);
  } catch (error) {
    console.error('Get user profile error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch user profile'
    });
  }
});

// Get user's Destiny memberships
router.get('/user/memberships', validateApiKey, validateAccessToken, async (req, res) => {
  try {
    const response = await bungieAPI.get('/User/GetMembershipsForCurrentUser/', {
      headers: {
        'Authorization': `Bearer ${req.accessToken}`
      }
    });

    if (response.data.ErrorCode !== 1) {
      return res.status(400).json({
        error: 'Bungie API Error',
        message: response.data.Message,
        errorCode: response.data.ErrorCode
      });
    }

    res.json(response.data.Response);
  } catch (error) {
    console.error('Get memberships error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch memberships'
    });
  }
});

// Get Destiny profile
router.get('/destiny2/:membershipType/profile/:membershipId', validateApiKey, validateAccessToken, async (req, res) => {
  try {
    const { membershipType, membershipId } = req.params;
    const { components } = req.query;
    
    if (!components) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'components query parameter is required'
      });
    }

    const response = await bungieAPI.get(
      `/Destiny2/${membershipType}/Profile/${membershipId}/?components=${components}`,
      {
        headers: {
          'Authorization': `Bearer ${req.accessToken}`
        }
      }
    );

    if (response.data.ErrorCode !== 1) {
      return res.status(400).json({
        error: 'Bungie API Error',
        message: response.data.Message,
        errorCode: response.data.ErrorCode
      });
    }

    res.json(response.data.Response);
  } catch (error) {
    console.error('Get profile error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch Destiny profile'
    });
  }
});

// Get character data
router.get('/destiny2/:membershipType/profile/:membershipId/character/:characterId', validateApiKey, validateAccessToken, async (req, res) => {
  try {
    const { membershipType, membershipId, characterId } = req.params;
    const { components } = req.query;
    
    if (!components) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'components query parameter is required'
      });
    }

    const response = await bungieAPI.get(
      `/Destiny2/${membershipType}/Profile/${membershipId}/Character/${characterId}/?components=${components}`,
      {
        headers: {
          'Authorization': `Bearer ${req.accessToken}`
        }
      }
    );

    if (response.data.ErrorCode !== 1) {
      return res.status(400).json({
        error: 'Bungie API Error',
        message: response.data.Message,
        errorCode: response.data.ErrorCode
      });
    }

    res.json(response.data.Response);
  } catch (error) {
    console.error('Get character error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch character data'
    });
  }
});

// Generic Bungie API proxy endpoint (for other endpoints)
router.all('/proxy/*', validateApiKey, validateAccessToken, async (req, res) => {
  try {
    const endpoint = req.params[0];
    const method = req.method.toLowerCase();
    
    const config = {
      method,
      url: `/${endpoint}`,
      headers: {
        'Authorization': `Bearer ${req.accessToken}`
      }
    };

    if (req.query && Object.keys(req.query).length > 0) {
      config.params = req.query;
    }

    if (req.body && Object.keys(req.body).length > 0) {
      config.data = req.body;
    }

    const response = await bungieAPI.request(config);

    if (response.data.ErrorCode !== 1) {
      return res.status(400).json({
        error: 'Bungie API Error',
        message: response.data.Message,
        errorCode: response.data.ErrorCode
      });
    }

    res.json(response.data.Response);
  } catch (error) {
    console.error('Proxy request error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Server Error',
      message: 'Proxy request failed'
    });
  }
});

module.exports = router;