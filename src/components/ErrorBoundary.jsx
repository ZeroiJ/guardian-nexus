import React from "react";
import Icon from "./AppIcon";
import { GuardianError, ERROR_CODES } from '../utils/errorHandler';

/**
 * Enhanced ErrorBoundary with better error categorization and 400 error handling
 * Provides fallback UI for JavaScript errors and API errors
 */

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorType: 'default'
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      error: error,
      errorType: ErrorBoundary.categorizeError(error)
    };
  }

  static categorizeError(error) {
    // Check if it's a GuardianError with specific type
    if (error instanceof GuardianError) {
      if (error.code === ERROR_CODES.BAD_REQUEST) return 'bad_request';
      if (error.code === ERROR_CODES.UNAUTHORIZED) return 'auth_failed';
      if (error.code === ERROR_CODES.FORBIDDEN) return 'account_restricted';
      if (error.code === ERROR_CODES.RATE_LIMITED) return 'rate_limit';
      if (error.code === ERROR_CODES.NETWORK_ERROR) return 'network';
    }

    // Check error message for common patterns
    const message = error?.message?.toLowerCase() || '';
    if (message.includes('400') || message.includes('bad request')) return 'bad_request';
    if (message.includes('401') || message.includes('unauthorized')) return 'auth_failed';
    if (message.includes('403') || message.includes('forbidden')) return 'account_restricted';
    if (message.includes('429') || message.includes('rate limit')) return 'rate_limit';
    if (message.includes('network') || message.includes('fetch')) return 'network';
    if (message.includes('token') || message.includes('authentication')) return 'token_invalid';
    
    return 'default';
  }

  componentDidCatch(error, errorInfo) {
    error.__ErrorBoundary = true;
    this.setState({ errorInfo });
    
    // Enhanced error logging with context
    console.group('🚨 ErrorBoundary caught an error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Error Type:', this.state.errorType);
    console.groupEnd();
    
    window.__COMPONENT_ERROR__?.(error, errorInfo);
  }

  getErrorDisplay() {
    const { error, errorType } = this.state;
    
    const errorConfig = {
      'bad_request': {
        title: 'Invalid Request',
        description: 'The application encountered a data validation error.',
        icon: 'AlertTriangle',
        color: 'text-red-600',
        showDetails: true
      },
      'auth_failed': {
        title: 'Authentication Error',
        description: 'Please refresh the page and try logging in again.',
        icon: 'ShieldX',
        color: 'text-red-600',
        showDetails: false
      },
      'token_invalid': {
        title: 'Session Expired',
        description: 'Your session has expired. Please refresh and log in again.',
        icon: 'Key',
        color: 'text-amber-600',
        showDetails: false
      },
      'network': {
        title: 'Connection Error',
        description: 'Unable to connect to services. Please check your connection.',
        icon: 'WifiOff',
        color: 'text-red-600',
        showDetails: false
      },
      'default': {
        title: 'Something went wrong',
        description: 'We encountered an unexpected error while processing your request.',
        icon: 'AlertCircle',
        color: 'text-red-600',
        showDetails: false
      }
    };

    return errorConfig[errorType] || errorConfig['default'];
  }

  render() {
    if (this.state?.hasError) {
      const errorDisplay = this.getErrorDisplay();
      const { error } = this.state;
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="text-center p-8 max-w-lg">
            <div className="flex justify-center items-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Icon name={errorDisplay.icon} size={32} className={errorDisplay.color} />
              </div>
            </div>
            
            <div className="flex flex-col gap-2 text-center mb-6">
              <h1 className="text-2xl font-medium text-neutral-800">{errorDisplay.title}</h1>
              <p className="text-neutral-600 text-base">{errorDisplay.description}</p>
            </div>

            {/* Error Details for debugging */}
            {errorDisplay.showDetails && error && (
              <div className="bg-neutral-100 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-sm font-medium text-neutral-800 mb-2">Technical Details:</h3>
                <div className="space-y-1 text-xs text-neutral-600">
                  {error?.message && (
                    <div><strong>Message:</strong> {error.message}</div>
                  )}
                  {error?.code && (
                    <div><strong>Code:</strong> {error.code}</div>
                  )}
                  <div><strong>Time:</strong> {new Date().toLocaleTimeString()}</div>
                </div>
              </div>
            )}

            <div className="flex justify-center items-center gap-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  window.location.reload();
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded flex items-center gap-2 transition-colors duration-200 shadow-sm"
              >
                <Icon name="RotateCcw" size={18} color="#fff" />
                Retry
              </button>
              
              <button
                onClick={() => {
                  window.location.href = "/";
                }}
                className="bg-neutral-500 hover:bg-neutral-600 text-white font-medium py-2 px-4 rounded flex items-center gap-2 transition-colors duration-200 shadow-sm"
              >
                <Icon name="ArrowLeft" size={18} color="#fff" />
                Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props?.children;
  }
}

export default ErrorBoundary;