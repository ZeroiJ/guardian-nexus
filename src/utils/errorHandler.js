/**
 * Production-safe error handling utilities for Guardian Nexus
 * Handles OAuth, API, and network errors with fallback mechanisms
 */

import logger from './logger';

/**
 * Enhanced error class with additional context
 */
export class GuardianError extends Error {
  constructor(message, code, context = {}) {
    super(message);
    this.name = 'GuardianError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Error codes for different types of failures
 */
export const ERROR_CODES = {
  // OAuth Errors
  OAUTH_INITIATION_FAILED: 'OAUTH_INITIATION_FAILED',
  OAUTH_STATE_VALIDATION_FAILED: 'OAUTH_STATE_VALIDATION_FAILED',
  OAUTH_TOKEN_EXCHANGE_FAILED: 'OAUTH_TOKEN_EXCHANGE_FAILED',
  OAUTH_CALLBACK_PROCESSING_FAILED: 'OAUTH_CALLBACK_PROCESSING_FAILED',
  
  // API Errors
  API_NETWORK_ERROR: 'API_NETWORK_ERROR',
  API_CORS_ERROR: 'API_CORS_ERROR',
  API_TIMEOUT_ERROR: 'API_TIMEOUT_ERROR',
  API_SERVER_ERROR: 'API_SERVER_ERROR',
  
  // State Management Errors
  STATE_STORAGE_ERROR: 'STATE_STORAGE_ERROR',
  STATE_RETRIEVAL_ERROR: 'STATE_RETRIEVAL_ERROR',
  
  // General Errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * Parse stored state data (handles both old string format and new JSON format)
 */
function parseStoredState(storedValue) {
  if (!storedValue) return null;
  
  try {
    // Try to parse as JSON (new format with timestamp)
    const parsed = JSON.parse(decodeURIComponent(storedValue));
    if (parsed.state && parsed.timestamp && parsed.expires) {
      return parsed;
    }
  } catch {
    // If parsing fails, treat as old format (plain state string)
    return {
      state: storedValue,
      timestamp: Date.now() - (5 * 60 * 1000), // Assume 5 minutes old
      expires: Date.now() + (10 * 60 * 1000) // Give 10 more minutes
    };
  }
  
  return null;
}

/**
 * Safely handle OAuth state validation with multiple fallback mechanisms
 */
export function validateOAuthState(receivedState, options = {}) {
  const { enableFallbacks = true, strictMode = false } = options;
  
  try {
    // Primary validation sources - use correct key 'bungie_oauth_state'
    const localStateRaw = localStorage.getItem('bungie_oauth_state');
    const sessionStateRaw = sessionStorage.getItem('bungie_oauth_state');
    const cookieStateRaw = getCookieValue('bungie_oauth_state');
    
    // Parse stored states
    const localState = parseStoredState(localStateRaw);
    const sessionState = parseStoredState(sessionStateRaw);
    const cookieState = parseStoredState(cookieStateRaw);
    
    // Filter valid, non-expired states
    const now = Date.now();
    const validationSources = [
      { name: 'localStorage', data: localState },
      { name: 'sessionStorage', data: sessionState },
      { name: 'cookie', data: cookieState }
    ].filter(source => {
      if (!source.data) return false;
      
      // Check if state has expired
      if (source.data.expires && now > source.data.expires) {
        logger.warn(`OAuth state expired in ${source.name}`, {
          expired: new Date(source.data.expires).toISOString(),
          now: new Date(now).toISOString()
        });
        return false;
      }
      
      return true;
    });
    
    if (!receivedState) {
      throw new GuardianError(
        'No state parameter received from OAuth provider',
        ERROR_CODES.OAUTH_STATE_VALIDATION_FAILED,
        { 
          validationSources: validationSources.map(s => s.name),
          hasStoredStates: validationSources.length > 0
        }
      );
    }
    
    if (validationSources.length === 0) {
      // Check if we had states but they were expired
      const expiredStates = [localState, sessionState, cookieState]
        .filter(state => state && state.expires && now > state.expires);
      
      if (expiredStates.length > 0) {
        throw new GuardianError(
          'OAuth state has expired. Please try connecting again.',
          ERROR_CODES.OAUTH_STATE_VALIDATION_FAILED,
          { 
            receivedState: receivedState.slice(0, 8) + '...',
            reason: 'expired_states',
            expiredCount: expiredStates.length
          }
        );
      }
      
      throw new GuardianError(
        'No stored state found for validation',
        ERROR_CODES.STATE_RETRIEVAL_ERROR,
        { 
          receivedState: receivedState.slice(0, 8) + '...',
          reason: 'no_stored_states'
        }
      );
    }
    
    // Try to match against any available stored state
    const matchingSource = validationSources.find(source => 
      source.data.state === receivedState
    );
    
    if (!matchingSource) {
      if (strictMode) {
        throw new GuardianError(
          'State validation failed - no matching state found',
          ERROR_CODES.OAUTH_STATE_VALIDATION_FAILED,
          {
            receivedState: receivedState.slice(0, 8) + '...',
            availableSources: validationSources.map(s => s.name),
            availableStates: validationSources.map(s => s.data.state.slice(0, 8) + '...'),
            strictMode: true
          }
        );
      }
      
      // In non-strict mode, log warning but allow continuation
      logger.warn('State validation warning - proceeding with caution', {
        receivedState: receivedState.slice(0, 8) + '...',
        availableSources: validationSources.map(s => s.name),
        strictMode: false
      });
    }
    
    // Clean up all stored states after successful validation
    cleanupOAuthState();
    
    return {
      isValid: !!matchingSource || !strictMode,
      matchedSource: matchingSource?.name || 'none',
      validationSources: validationSources.map(s => s.name),
      stateAge: matchingSource ? now - matchingSource.data.timestamp : null
    };
    
  } catch (error) {
    if (error instanceof GuardianError) {
      throw error;
    }
    
    throw new GuardianError(
      `State validation error: ${error.message}`,
      ERROR_CODES.OAUTH_STATE_VALIDATION_FAILED,
      { originalError: error.message }
    );
  }
}

/**
 * Enhanced fetch wrapper with retry logic, error handling, and 400 error diagnostics
 */
export async function safeFetch(url, options = {}) {
  const {
    retries = 2,
    timeout = 10000,
    retryDelay = 1000,
    ...fetchOptions
  } = options;
  
  let lastError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      logger.debug('Making HTTP request', {
        url,
        method: fetchOptions.method || 'GET',
        attempt: attempt + 1,
        maxAttempts: retries + 1,
        hasBody: !!fetchOptions.body,
        headers: fetchOptions.headers ? Object.keys(fetchOptions.headers) : []
      });
      
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        let errorData;
        let errorText = '';
        
        try {
          errorText = await response.text();
          // Try to parse as JSON first
          try {
            errorData = JSON.parse(errorText);
          } catch {
            // If not JSON, use the text as is
            errorData = { message: errorText };
          }
        } catch (parseError) {
          errorData = { message: 'Unable to parse error response' };
          logger.warn('Failed to parse error response', {
            url,
            status: response.status,
            parseError: parseError.message
          });
        }

        // Enhanced 400 error handling with detailed diagnostics
        if (response.status === 400) {
          const diagnostics = {
            url,
            method: fetchOptions.method || 'GET',
            status: response.status,
            statusText: response.statusText,
            errorData,
            requestHeaders: fetchOptions.headers || {},
            attempt: attempt + 1
          };

          // Analyze request body for common 400 issues
          if (fetchOptions.body) {
            try {
              const bodyData = typeof fetchOptions.body === 'string' ? 
                JSON.parse(fetchOptions.body) : fetchOptions.body;
              diagnostics.requestBody = bodyData;
              
              // Check for common 400 causes
              const possibleCauses = [];
              
              if (bodyData.grant_type === 'authorization_code' && !bodyData.code) {
                possibleCauses.push('Missing authorization code');
              }
              if (bodyData.grant_type === 'refresh_token' && !bodyData.refresh_token) {
                possibleCauses.push('Missing refresh token');
              }
              if (bodyData.grant_type && !['authorization_code', 'refresh_token'].includes(bodyData.grant_type)) {
                possibleCauses.push('Invalid grant_type');
              }
              
              diagnostics.possibleCauses = possibleCauses;
            } catch (bodyParseError) {
              diagnostics.bodyParseError = bodyParseError.message;
            }
          }

          logger.error('HTTP 400 Bad Request - Detailed diagnostics', diagnostics);
          
          throw new GuardianError(
            `HTTP 400 Bad Request: ${errorData.message || response.statusText}`,
            ERROR_CODES.API_NETWORK_ERROR,
            diagnostics
          );
        }
        
        // Handle other HTTP errors with enhanced logging
        const errorContext = {
          url,
          status: response.status,
          statusText: response.statusText,
          errorData,
          attempt: attempt + 1
        };
        
        if (response.status === 401) {
          logger.error('HTTP 401 Unauthorized', errorContext);
        } else if (response.status === 403) {
          logger.error('HTTP 403 Forbidden', errorContext);
        } else if (response.status >= 500) {
          logger.error('HTTP Server Error', errorContext);
        } else {
          logger.error('HTTP Client Error', errorContext);
        }
        
        throw new GuardianError(
          `HTTP ${response.status}: ${errorData.message || response.statusText}`,
          response.status >= 500 ? ERROR_CODES.API_SERVER_ERROR : ERROR_CODES.API_NETWORK_ERROR,
          errorContext
        );
      }
      
      logger.debug('HTTP request successful', {
        url,
        status: response.status,
        attempt: attempt + 1
      });
      
      return response;
      
    } catch (error) {
      lastError = error;
      
      // Handle different types of errors
      if (error.name === 'AbortError') {
        logger.error('Request timeout', { url, timeout, attempt: attempt + 1 });
        lastError = new GuardianError(
          `Request timeout after ${timeout}ms`,
          ERROR_CODES.API_TIMEOUT_ERROR,
          { url, timeout, attempt: attempt + 1 }
        );
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        lastError = new GuardianError(
          'Network error - check internet connection and CORS configuration',
          ERROR_CODES.API_NETWORK_ERROR,
          { url, originalError: error.message, attempt: attempt + 1 }
        );
      }
      
      // Don't retry on certain errors
      if (error instanceof GuardianError && 
          ([ERROR_CODES.API_CORS_ERROR, ERROR_CODES.OAUTH_STATE_VALIDATION_FAILED].includes(error.code) ||
           (error.context?.status === 400 || error.context?.status === 401))) {
        logger.error('Non-retryable error encountered', {
          error: error.message,
          type: error.constructor.name,
          status: error.context?.status,
          attempt: attempt + 1
        });
        break;
      }
      
      // Wait before retry (except on last attempt)
      if (attempt < retries) {
        const delay = retryDelay * (attempt + 1);
        logger.warn(`Request failed, retrying in ${delay}ms`, {
          url,
          error: error.message,
          attempt: attempt + 1,
          nextAttempt: attempt + 2,
          delay
        });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  if (lastError instanceof GuardianError) {
    logger.error('Final attempt failed', {
      error: lastError.message,
      context: lastError.context,
      totalAttempts: retries + 1
    });
  } else {
    logger.error('Network error after all retries', {
      error: lastError?.message,
      url,
      totalAttempts: retries + 1
    });
  }
  
  throw lastError;
}

/**
 * Clean up OAuth state from all storage mechanisms
 */
export function cleanupOAuthState() {
  try {
    localStorage.removeItem('bungie_oauth_state');
    sessionStorage.removeItem('bungie_oauth_state');
    
    // Remove cookie with all possible path variations
    document.cookie = 'bungie_oauth_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'bungie_oauth_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/auth;';
    
    logger.debug('OAuth state cleanup completed');
  } catch (error) {
    logger.warn('Failed to cleanup OAuth state', { error: error.message });
  }
}

/**
 * Proactively clean up expired OAuth states
 */
export function cleanupExpiredOAuthStates() {
  try {
    const now = Date.now();
    const sources = [
      { name: 'localStorage', key: 'bungie_oauth_state' },
      { name: 'sessionStorage', key: 'bungie_oauth_state' }
    ];
    
    sources.forEach(({ name, key }) => {
      try {
        const storage = name === 'localStorage' ? localStorage : sessionStorage;
        const storedValue = storage.getItem(key);
        
        if (storedValue) {
          const parsed = parseStoredState(storedValue);
          if (parsed && parsed.expires && now > parsed.expires) {
            storage.removeItem(key);
            logger.debug(`Cleaned up expired OAuth state from ${name}`);
          }
        }
      } catch (error) {
        logger.warn(`Failed to check/cleanup expired state in ${name}`, { error: error.message });
      }
    });
    
    // Check and cleanup expired cookie
    const cookieState = getCookieValue('bungie_oauth_state');
    if (cookieState) {
      const parsed = parseStoredState(cookieState);
      if (parsed && parsed.expires && now > parsed.expires) {
        document.cookie = 'bungie_oauth_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        logger.debug('Cleaned up expired OAuth state from cookie');
      }
    }
  } catch (error) {
    logger.warn('Failed to cleanup expired OAuth states', { error: error.message });
  }
}

/**
 * Get cookie value by name
 */
function getCookieValue(name) {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
    return null;
  } catch (error) {
    logger.warn('Failed to read cookie', { name, error: error.message });
    return null;
  }
}

/**
 * Handle and format errors for user display
 */
export function formatUserError(error) {
  if (error instanceof GuardianError) {
    switch (error.code) {
      case ERROR_CODES.OAUTH_STATE_VALIDATION_FAILED:
        return 'Security validation failed. Please try connecting again.';
      case ERROR_CODES.OAUTH_TOKEN_EXCHANGE_FAILED:
        return 'Failed to complete authorization. Please try again.';
      case ERROR_CODES.API_NETWORK_ERROR:
      case ERROR_CODES.API_CORS_ERROR:
        return 'Network connection issue. Please check your internet connection and try again.';
      case ERROR_CODES.API_TIMEOUT_ERROR:
        return 'Request timed out. Please try again.';
      case ERROR_CODES.API_SERVER_ERROR:
        return 'Server error. Please try again in a few moments.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
  
  return error?.message || 'An unexpected error occurred.';
}

/**
 * Global error handler for unhandled promise rejections
 */
export function setupGlobalErrorHandling() {
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled promise rejection', {
        error: event.reason?.message || event.reason,
        stack: event.reason?.stack
      });
      
      // Prevent the default browser behavior
      event.preventDefault();
    });
    
    window.addEventListener('error', (event) => {
      logger.error('Global error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.message
      });
    });
  }
}