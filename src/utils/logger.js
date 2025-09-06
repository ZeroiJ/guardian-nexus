/**
 * Production-safe logging utility for Guardian Nexus
 * Provides structured logging with different levels and production safety
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor() {
    this.level = this.getLogLevel();
    this.isProduction = import.meta.env.PROD;
  }

  getLogLevel() {
    const envLevel = import.meta.env.VITE_LOG_LEVEL || 'INFO';
    return LOG_LEVELS[envLevel.toUpperCase()] ?? LOG_LEVELS.INFO;
  }

  /**
   * Format log message with timestamp and context
   */
  formatMessage(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context
    };

    return this.isProduction ? JSON.stringify(logEntry) : logEntry;
  }

  /**
   * Safe console logging that works in all environments
   */
  log(level, message, context = {}) {
    if (LOG_LEVELS[level] > this.level) return;

    const formattedMessage = this.formatMessage(level, message, context);
    
    try {
      switch (level) {
        case 'ERROR':
          console.error(formattedMessage);
          break;
        case 'WARN':
          console.warn(formattedMessage);
          break;
        case 'INFO':
          console.info(formattedMessage);
          break;
        case 'DEBUG':
          console.debug(formattedMessage);
          break;
        default:
          console.log(formattedMessage);
      }
    } catch (consoleError) {
      // Fallback if console methods are not available
      try {
        console.log(`[${level}] ${message}`, context);
      } catch {
        // Silent fail in environments where console is not available
      }
    }
  }

  error(message, context = {}) {
    this.log('ERROR', message, context);
  }

  warn(message, context = {}) {
    this.log('WARN', message, context);
  }

  info(message, context = {}) {
    this.log('INFO', message, context);
  }

  debug(message, context = {}) {
    this.log('DEBUG', message, context);
  }

  /**
   * OAuth-specific error logging with structured context
   */
  oauthError(operation, error, context = {}) {
    this.error(`OAuth ${operation} failed`, {
      operation,
      error: error?.message || error,
      stack: error?.stack,
      ...context
    });
  }

  /**
   * API request error logging
   */
  apiError(endpoint, error, context = {}) {
    this.error(`API request failed: ${endpoint}`, {
      endpoint,
      error: error?.message || error,
      status: error?.status,
      ...context
    });
  }

  /**
   * State validation error logging
   */
  stateValidationError(details) {
    this.error('OAuth state validation failed', {
      component: 'StateValidation',
      ...details
    });
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;

// Named exports for convenience - bind methods to maintain 'this' context
export const error = logger.error.bind(logger);
export const warn = logger.warn.bind(logger);
export const info = logger.info.bind(logger);
export const debug = logger.debug.bind(logger);
export const oauthError = logger.oauthError.bind(logger);
export const apiError = logger.apiError.bind(logger);
export const stateValidationError = logger.stateValidationError.bind(logger);