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
 * Safely handle OAuth state validation with multiple fallback mechanisms
 */
export function validateOAuthState(receivedState, options = {}) {
  const { enableFallbacks = true, strictMode = false } = options;
  
  try {
    // Primary validation sources - use correct key 'bungie_oauth_state'
    const localState = localStorage.getItem('bungie_oauth_state');
    const sessionState = sessionStorage.getItem('bungie_oauth_state');
    const cookieState = getCookieValue('bungie_oauth_state');
    
    // Validation logic with fallbacks
    const validationSources = [
      { name: 'localStorage', value: localState },
      { name: 'sessionStorage', value: sessionState },
      { name: 'cookie', value: cookieState }
    ].filter(source => source.value);
    
    if (!receivedState) {
      throw new GuardianError(
        'No state parameter received from OAuth provider',
        ERROR_CODES.OAUTH_STATE_VALIDATION_FAILED,
        { validationSources: validationSources.map(s => s.name) }
      );
    }
    
    if (validationSources.length === 0) {
      throw new GuardianError(
        'No stored state found for validation',
        ERROR_CODES.STATE_RETRIEVAL_ERROR,
        { receivedState: receivedState.slice(0, 8) + '...' }
      );
    }
    
    // Try to match against any available stored state
    const matchingSource = validationSources.find(source => 
      source.value === receivedState
    );
    
    if (!matchingSource) {
      if (strictMode) {
        throw new GuardianError(
          'State validation failed - no matching state found',
          ERROR_CODES.OAUTH_STATE_VALIDATION_FAILED,
          {
            receivedState: receivedState.slice(0, 8) + '...',
            availableSources: validationSources.map(s => s.name),
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
      validationSources: validationSources.map(s => s.name)
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
 * Enhanced fetch wrapper with retry logic and error handling
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
      
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new GuardianError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status >= 500 ? ERROR_CODES.API_SERVER_ERROR : ERROR_CODES.API_NETWORK_ERROR,
          {
            url,
            status: response.status,
            statusText: response.statusText,
            errorData,
            attempt: attempt + 1
          }
        );
      }
      
      return response;
      
    } catch (error) {
      lastError = error;
      
      // Handle different types of errors
      if (error.name === 'AbortError') {
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
          [ERROR_CODES.API_CORS_ERROR, ERROR_CODES.OAUTH_STATE_VALIDATION_FAILED].includes(error.code)) {
        break;
      }
      
      // Wait before retry (except on last attempt)
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        logger.warn(`Retrying request (${attempt + 1}/${retries})`, { url, error: error.message });
      }
    }
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
    
    // Remove cookie
    document.cookie = 'bungie_oauth_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    logger.debug('OAuth state cleanup completed');
  } catch (error) {
    logger.warn('Failed to cleanup OAuth state', { error: error.message });
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