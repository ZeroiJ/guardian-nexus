/**
 * Health Check Endpoint
 * Simple endpoint to verify serverless backend is working correctly
 */

const { setupCORS, createSuccessResponse, validateEnvironment } = require('./utils/bungie-client');
const { withErrorHandler } = require('./utils/error-handler');

/**
 * Main handler for health check endpoint
 * @param {Object} req - Vercel request object
 * @param {Object} res - Vercel response object
 * @returns {Object} Health status response
 */
async function handler(req, res) {
  // Setup CORS
  setupCORS(res);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET.',
      allowedMethods: ['GET']
    });
  }
  
  try {
    // Check environment variables
    let envStatus = 'healthy';
    const missingVars = [];
    
    const requiredVars = [
      'BUNGIE_API_KEY',
      'BUNGIE_CLIENT_ID',
      'BUNGIE_CLIENT_SECRET'
    ];
    
    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        missingVars.push(varName);
        envStatus = 'warning';
      }
    });
    
    // Test Bungie API connectivity (optional)
    let bungieApiStatus = 'not_tested';
    if (req.query.testBungieApi === 'true' && envStatus === 'healthy') {
      try {
        const response = await fetch('https://www.bungie.net/Platform/Destiny2/Manifest/', {
          headers: {
            'X-API-Key': process.env.BUNGIE_API_KEY
          }
        });
        
        if (response.ok) {
          bungieApiStatus = 'healthy';
        } else {
          bungieApiStatus = 'error';
        }
      } catch (error) {
        bungieApiStatus = 'error';
      }
    }
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '0.1.1',
      architecture: 'serverless',
      platform: 'vercel',
      environment: {
        status: envStatus,
        missingVariables: missingVars.length > 0 ? missingVars : undefined
      },
      services: {
        bungieApi: bungieApiStatus
      },
      endpoints: {
        auth: {
          token: '/api/auth/token',
          memberships: '/api/auth/memberships'
        },
        destiny2: {
          profile: '/api/destiny2/profile',
          character: '/api/destiny2/character',
          manifest: '/api/destiny2/manifest'
        },
        health: '/api/health'
      },
      features: {
        oauthTokenExchange: true,
        userMemberships: true,
        profileData: true,
        characterData: true,
        manifestLookup: true,
        errorHandling: true,
        corsSupport: true,
        authenticationMiddleware: true
      }
    };
    
    return createSuccessResponse(res, healthData, 'Guardian Nexus API is healthy and operational');
    
  } catch (error) {
    // Re-throw to be handled by error handler
    throw error;
  }
}

// Export handler wrapped with error handling
module.exports = withErrorHandler(handler);