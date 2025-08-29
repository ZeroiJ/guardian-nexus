import { createAuthenticatedRequest } from '../config/bungie.js';

// Authentication middleware
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please provide a valid Bearer token'
    });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  req.accessToken = token;
  req.authenticatedAPI = createAuthenticatedRequest(token);
  
  next();
};

// Rate limiting middleware (basic implementation)
export const rateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old requests
    const clientRequests = requests.get(clientId) || [];
    const recentRequests = clientRequests.filter(time => time > windowStart);
    
    if (recentRequests.length >= max) {
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil(windowMs / 1000)} seconds.`
      });
    }
    
    // Add current request
    recentRequests.push(now);
    requests.set(clientId, recentRequests);
    
    next();
  };
};

// Request validation middleware
export const validateRequest = (schema) => {
  return (req, res, next) => {
    // TODO: Implement request validation using Joi or similar
    // For now, just basic validation
    console.log('Request validation - TODO: Implement proper validation');
    next();
  };
};

// Bungie API error handler middleware
export const handleBungieErrors = (error, req, res, next) => {
  if (error.bungieErrorCode) {
    // Handle specific Bungie error codes
    const bungieErrorMap = {
      1: 'Success',
      2: 'Transport exception',
      3: 'Unhandled exception',
      4: 'Not implemented',
      5: 'System disabled',
      6: 'Failed to load available locales',
      7: 'Parameter parse failure',
      8: 'Parameter invalid range',
      9: 'Bad request',
      10: 'Authentication invalid',
      11: 'Data not found',
      12: 'Insufficient privileges',
      13: 'Duplicate',
      14: 'Unknown SQL exception',
      15: 'Insufficient privileges',
      16: 'Unhandled exception',
      17: 'Unsupported locale',
      18: 'Invalid parameters',
      19: 'Parameter not found',
      20: 'Invalid page number',
      21: 'Invalid parameters',
      1601: 'Destiny account not found',
      1618: 'Destiny character not found',
      1623: 'Destiny privacy restriction',
      1624: 'Destiny account verification required',
      1665: 'Destiny vendor not found',
      1670: 'Destiny item not transferable',
      1671: 'Destiny item not found',
      1672: 'Destiny cannot perform action on equipped item',
      1673: 'Destiny character not logged in recently',
      1674: 'Destiny character class not valid for requested action',
    };
    
    const errorMessage = bungieErrorMap[error.bungieErrorCode] || 'Unknown Bungie API error';
    
    return res.status(400).json({
      error: 'Bungie API Error',
      code: error.bungieErrorCode,
      message: errorMessage,
      details: error.message
    });
  }
  
  next(error);
};

// CORS middleware for specific origins
export const corsMiddleware = (allowedOrigins = []) => {
  return (req, res, next) => {
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
    res.setHeader('Access-Control-Allow-Credentials', true);
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  };
};