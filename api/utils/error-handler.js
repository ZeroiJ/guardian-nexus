/**
 * Centralized Error Handler for Vercel Serverless Functions
 * Provides consistent error handling, logging, and response formatting
 */

const { createErrorResponse } = require('./bungie-client');

// Error types and their default HTTP status codes
const ERROR_TYPES = {
  VALIDATION_ERROR: { status: 400, type: 'Validation Error' },
  AUTHENTICATION_ERROR: { status: 401, type: 'Authentication Error' },
  AUTHORIZATION_ERROR: { status: 403, type: 'Authorization Error' },
  NOT_FOUND_ERROR: { status: 404, type: 'Not Found' },
  RATE_LIMIT_ERROR: { status: 429, type: 'Rate Limit Exceeded' },
  BUNGIE_API_ERROR: { status: 502, type: 'Bungie API Error' },
  SERVER_ERROR: { status: 500, type: 'Internal Server Error' }
};

// Bungie API specific error codes
const BUNGIE_ERROR_CODES = {
  1: 'Success',
  2: 'TransportException',
  5: 'InternalException',
  7: 'UserBanned',
  11: 'ApiInvalidOrExpiredKey',
  12: 'ApiKeyMissingFromRequest',
  13: 'OriginHeaderDoesNotMatchKey',
  18: 'WebAuthRequired',
  36: 'WebAuthModuleAsyncFailed',
  99: 'ApiExceededMaxKeys',
  1601: 'DestinyAccountNotFound',
  1618: 'DestinyPrivacyRestriction',
  1627: 'DestinyCharacterNotFound'
};

/**
 * Parse Bungie API error from response
 * @param {Object} error - Error object or Bungie API response
 * @returns {Object} Parsed error information
 */
function parseBungieError(error) {
  // Handle fetch/network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      type: 'BUNGIE_API_ERROR',
      message: 'Failed to connect to Bungie API',
      details: { networkError: true }
    };
  }

  // Handle Bungie API response errors
  if (error.ErrorCode !== undefined) {
    const errorCode = error.ErrorCode;
    const errorMessage = BUNGIE_ERROR_CODES[errorCode] || error.ErrorStatus || 'Unknown Bungie API Error';
    
    return {
      type: 'BUNGIE_API_ERROR',
      message: `${errorMessage}: ${error.Message || 'No additional details'}`,
      details: {
        bungieErrorCode: errorCode,
        bungieErrorStatus: error.ErrorStatus,
        bungieMessage: error.Message
      }
    };
  }

  // Handle HTTP response errors
  if (error.message && error.message.includes('Bungie API Error:')) {
    return {
      type: 'BUNGIE_API_ERROR',
      message: error.message,
      details: { httpError: true }
    };
  }

  return null;
}

/**
 * Determine error type from error object
 * @param {Error} error - Error object
 * @returns {string} Error type key
 */
function determineErrorType(error) {
  const message = error.message.toLowerCase();
  
  // Check for specific error patterns
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return 'VALIDATION_ERROR';
  }
  
  if (message.includes('unauthorized') || message.includes('token') || message.includes('authentication')) {
    return 'AUTHENTICATION_ERROR';
  }
  
  if (message.includes('forbidden') || message.includes('access denied') || message.includes('permission')) {
    return 'AUTHORIZATION_ERROR';
  }
  
  if (message.includes('not found') || message.includes('does not exist')) {
    return 'NOT_FOUND_ERROR';
  }
  
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'RATE_LIMIT_ERROR';
  }
  
  if (message.includes('bungie') || message.includes('api error')) {
    return 'BUNGIE_API_ERROR';
  }
  
  return 'SERVER_ERROR';
}

/**
 * Log error with structured format
 * @param {Error} error - Error object
 * @param {Object} context - Additional context information
 */
function logError(error, context = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    context: {
      endpoint: context.endpoint,
      method: context.method,
      userId: context.userId,
      membershipId: context.membershipId,
      userAgent: context.userAgent,
      ip: context.ip
    }
  };
  
  console.error('API Error:', JSON.stringify(logEntry, null, 2));
}

/**
 * Handle and format error response
 * @param {Error} error - Error object
 * @param {Object} res - Vercel response object
 * @param {Object} context - Request context for logging
 * @returns {Object} Formatted error response
 */
function handleError(error, res, context = {}) {
  // Log the error
  logError(error, context);
  
  // Check if it's a Bungie API error
  const bungieError = parseBungieError(error);
  if (bungieError) {
    const errorConfig = ERROR_TYPES[bungieError.type];
    return createErrorResponse(
      res,
      errorConfig.status,
      errorConfig.type,
      bungieError.message,
      bungieError.details
    );
  }
  
  // Determine error type and create response
  const errorType = determineErrorType(error);
  const errorConfig = ERROR_TYPES[errorType];
  
  return createErrorResponse(
    res,
    errorConfig.status,
    errorConfig.type,
    error.message,
    {
      errorCode: errorType,
      timestamp: new Date().toISOString()
    }
  );
}

/**
 * Wrapper function for serverless endpoints with error handling
 * @param {Function} handler - Endpoint handler function
 * @returns {Function} Wrapped handler with error handling
 */
function withErrorHandler(handler) {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (error) {
      const context = {
        endpoint: req.url,
        method: req.method,
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress
      };
      
      return handleError(error, res, context);
    }
  };
}

/**
 * Create validation error
 * @param {string} message - Validation error message
 * @param {Object} details - Validation details
 * @returns {Error} Validation error
 */
function createValidationError(message, details = {}) {
  const error = new Error(message);
  error.name = 'ValidationError';
  error.details = details;
  return error;
}

/**
 * Create authentication error
 * @param {string} message - Authentication error message
 * @returns {Error} Authentication error
 */
function createAuthenticationError(message = 'Authentication required') {
  const error = new Error(message);
  error.name = 'AuthenticationError';
  return error;
}

/**
 * Create authorization error
 * @param {string} message - Authorization error message
 * @returns {Error} Authorization error
 */
function createAuthorizationError(message = 'Access denied') {
  const error = new Error(message);
  error.name = 'AuthorizationError';
  return error;
}

module.exports = {
  ERROR_TYPES,
  BUNGIE_ERROR_CODES,
  parseBungieError,
  determineErrorType,
  logError,
  handleError,
  withErrorHandler,
  createValidationError,
  createAuthenticationError,
  createAuthorizationError
};