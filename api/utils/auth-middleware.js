/**
 * Authentication Middleware for Vercel Serverless Functions
 * Provides token validation and user authentication utilities
 */

const { makeBungieRequest, extractAccessToken, createErrorResponse } = require('./bungie-client');

/**
 * Validate OAuth access token with Bungie API
 * @param {string} accessToken - OAuth access token
 * @returns {Promise<Object>} User membership data or throws error
 */
async function validateAccessToken(accessToken) {
  if (!accessToken) {
    throw new Error('Access token is required');
  }

  try {
    // Validate token by fetching user memberships
    const response = await makeBungieRequest('/User/GetMembershipsForCurrentUser/', {
      accessToken
    });

    if (!response.Response) {
      throw new Error('Invalid token response');
    }

    return {
      isValid: true,
      user: response.Response,
      memberships: response.Response.destinyMemberships || [],
      bungieNetUser: response.Response.bungieNetUser || {}
    };
  } catch (error) {
    console.error('Token validation failed:', error.message);
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Middleware function to authenticate requests
 * @param {Object} req - Vercel request object
 * @param {Object} res - Vercel response object
 * @returns {Promise<Object>} Authentication result with user data
 */
async function authenticateRequest(req, res) {
  const accessToken = extractAccessToken(req);
  
  if (!accessToken) {
    throw new Error('Authorization header with Bearer token is required');
  }

  try {
    const authResult = await validateAccessToken(accessToken);
    return {
      ...authResult,
      accessToken
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Check if user has specific Destiny 2 membership
 * @param {Array} memberships - User's Destiny memberships
 * @param {number} membershipType - Platform type (1=Xbox, 2=PSN, 3=Steam, etc.)
 * @returns {Object|null} Membership data or null if not found
 */
function findMembershipByType(memberships, membershipType) {
  return memberships.find(membership => 
    membership.membershipType === parseInt(membershipType)
  ) || null;
}

/**
 * Get primary Destiny membership for user
 * @param {Array} memberships - User's Destiny memberships
 * @returns {Object|null} Primary membership or most recent one
 */
function getPrimaryMembership(memberships) {
  if (!memberships || memberships.length === 0) {
    return null;
  }

  // Find cross-save primary membership
  const primary = memberships.find(m => m.crossSaveOverride === m.membershipType);
  if (primary) {
    return primary;
  }

  // Return most recently played membership
  return memberships.sort((a, b) => 
    new Date(b.dateLastPlayed) - new Date(a.dateLastPlayed)
  )[0];
}

/**
 * Validate membership access for specific platform
 * @param {Array} memberships - User's memberships
 * @param {number} membershipType - Required platform type
 * @param {string} membershipId - Required membership ID
 * @returns {boolean} Whether user has access to this membership
 */
function validateMembershipAccess(memberships, membershipType, membershipId) {
  return memberships.some(membership => 
    membership.membershipType === parseInt(membershipType) &&
    membership.membershipId === membershipId
  );
}

/**
 * Create authentication error response
 * @param {Object} res - Vercel response object
 * @param {string} message - Error message
 * @param {number} status - HTTP status code (default: 401)
 * @returns {Object} Error response
 */
function createAuthError(res, message, status = 401) {
  return createErrorResponse(res, status, 'Authentication Error', message, {
    requiresAuth: true
  });
}

/**
 * Wrapper function for protected endpoints
 * @param {Function} handler - Endpoint handler function
 * @returns {Function} Protected endpoint handler
 */
function requireAuth(handler) {
  return async (req, res) => {
    try {
      const auth = await authenticateRequest(req, res);
      return await handler(req, res, auth);
    } catch (error) {
      console.error('Authentication failed:', error.message);
      return createAuthError(res, error.message);
    }
  };
}

/**
 * Wrapper for endpoints that require specific membership access
 * @param {Function} handler - Endpoint handler function
 * @returns {Function} Protected endpoint handler with membership validation
 */
function requireMembership(handler) {
  return requireAuth(async (req, res, auth) => {
    const { membershipType, membershipId } = req.query;
    
    if (!membershipType || !membershipId) {
      return createAuthError(res, 'membershipType and membershipId are required', 400);
    }

    const hasAccess = validateMembershipAccess(
      auth.memberships, 
      membershipType, 
      membershipId
    );

    if (!hasAccess) {
      return createAuthError(res, 'Access denied to this membership', 403);
    }

    return await handler(req, res, auth);
  });
}

module.exports = {
  validateAccessToken,
  authenticateRequest,
  findMembershipByType,
  getPrimaryMembership,
  validateMembershipAccess,
  createAuthError,
  requireAuth,
  requireMembership
};