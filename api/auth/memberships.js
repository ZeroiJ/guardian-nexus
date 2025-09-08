/**
 * User Memberships Endpoint
 * Fetches authenticated user's Destiny 2 memberships and profile information
 */

const { setupCORS, makeBungieRequest, createSuccessResponse } = require('../utils/bungie-client');
const { requireAuth } = require('../utils/auth-middleware');
const { withErrorHandler, createValidationError } = require('../utils/error-handler');

/**
 * Get user's Destiny memberships with additional profile data
 * @param {string} accessToken - OAuth access token
 * @returns {Promise<Object>} User memberships and profile data
 */
async function getUserMemberships(accessToken) {
  const response = await makeBungieRequest('/User/GetMembershipsForCurrentUser/', {
    accessToken
  });
  
  if (!response.Response) {
    throw new Error('Failed to retrieve user memberships');
  }
  
  const userData = response.Response;
  const destinyMemberships = userData.destinyMemberships || [];
  
  // Enhance membership data with additional information
  const enhancedMemberships = destinyMemberships.map(membership => ({
    membershipType: membership.membershipType,
    membershipId: membership.membershipId,
    displayName: membership.displayName,
    bungieGlobalDisplayName: membership.bungieGlobalDisplayName,
    bungieGlobalDisplayNameCode: membership.bungieGlobalDisplayNameCode,
    crossSaveOverride: membership.crossSaveOverride,
    applicableMembershipTypes: membership.applicableMembershipTypes,
    isPublic: membership.isPublic,
    membershipFlags: membership.membershipFlags,
    dateLastPlayed: membership.dateLastPlayed,
    platformName: getPlatformName(membership.membershipType),
    isPrimary: membership.crossSaveOverride === membership.membershipType,
    isActive: membership.dateLastPlayed && 
      new Date(membership.dateLastPlayed) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Active in last 30 days
  }));
  
  // Sort memberships by priority (primary first, then by last played)
  enhancedMemberships.sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return new Date(b.dateLastPlayed) - new Date(a.dateLastPlayed);
  });
  
  return {
    bungieNetUser: {
      membershipId: userData.bungieNetUser?.membershipId,
      uniqueName: userData.bungieNetUser?.uniqueName,
      normalizedName: userData.bungieNetUser?.normalizedName,
      displayName: userData.bungieNetUser?.displayName,
      profilePicture: userData.bungieNetUser?.profilePicture,
      profileTheme: userData.bungieNetUser?.profileTheme,
      userTitle: userData.bungieNetUser?.userTitle,
      successMessageFlags: userData.bungieNetUser?.successMessageFlags,
      isDeleted: userData.bungieNetUser?.isDeleted,
      about: userData.bungieNetUser?.about,
      firstAccess: userData.bungieNetUser?.firstAccess,
      lastUpdate: userData.bungieNetUser?.lastUpdate
    },
    destinyMemberships: enhancedMemberships,
    primaryMembershipId: userData.primaryMembershipId,
    bungieNetUserInfo: userData.bungieNetUserInfo,
    totalMemberships: enhancedMemberships.length,
    activeMemberships: enhancedMemberships.filter(m => m.isActive).length,
    crossSaveEnabled: enhancedMemberships.some(m => m.crossSaveOverride !== 0)
  };
}

/**
 * Get platform name from membership type
 * @param {number} membershipType - Platform membership type
 * @returns {string} Platform name
 */
function getPlatformName(membershipType) {
  const platforms = {
    1: 'Xbox',
    2: 'PlayStation',
    3: 'Steam',
    4: 'Blizzard',
    5: 'Stadia',
    6: 'Epic Games Store',
    10: 'Demon',
    254: 'BungieNext'
  };
  
  return platforms[membershipType] || 'Unknown';
}

/**
 * Main handler for memberships endpoint
 * @param {Object} req - Vercel request object
 * @param {Object} res - Vercel response object
 * @param {Object} auth - Authentication data from middleware
 * @returns {Object} User memberships response
 */
async function handler(req, res, auth) {
  // Setup CORS
  setupCORS(res);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    throw createValidationError('Method not allowed. Use GET.', { allowedMethods: ['GET'] });
  }
  
  try {
    // Get enhanced user memberships
    const membershipData = await getUserMemberships(auth.accessToken);
    
    return createSuccessResponse(res, membershipData, 'User memberships retrieved successfully');
    
  } catch (error) {
    // Re-throw to be handled by error handler
    throw error;
  }
}

// Export handler wrapped with authentication and error handling
module.exports = requireAuth(withErrorHandler(handler));