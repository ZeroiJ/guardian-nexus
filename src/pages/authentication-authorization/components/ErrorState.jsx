import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

/**
 * Enhanced ErrorState component with comprehensive 400 error handling
 * Provides detailed diagnostics and user-friendly error messages
 * @param {Object} error - Error object with type, message, code, and details
 * @param {Function} onRetry - Callback for retry action
 * @param {Function} onGoBack - Callback for go back action
 */

const ErrorState = ({ error, onRetry, onGoBack }) => {
  const getErrorInfo = (errorType) => {
    const errorMap = {
      'network': {
        icon: 'WifiOff',
        title: 'Connection Problem',
        description: 'Unable to connect to Bungie.net. Please check your internet connection.',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        canRetry: true
      },
      'auth_failed': {
        icon: 'ShieldX',
        title: 'Authentication Failed',
        description: 'Your login credentials were rejected. Please try again.',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        canRetry: true
      },
      'auth_required': {
        icon: 'AlertTriangle',
        title: 'Login Required',
        description: 'Please log in to your account first before connecting to Bungie.net.',
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        canRetry: false
      },
      'oauth_error': {
        icon: 'XCircle',
        title: 'Authorization Denied',
        description: 'The authorization process was cancelled or denied.',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        canRetry: true
      },
      'callback_error': {
        icon: 'AlertCircle',
        title: 'Connection Error',
        description: 'There was a problem completing the authentication process.',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        canRetry: true
      },
      'bungie_connection_error': {
        icon: 'ServerX',
        title: 'Bungie.net Error',
        description: 'There was a problem connecting to Bungie.net services.',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        canRetry: true
      },
      'account_restricted': {
        icon: 'Lock',
        title: 'Account Restricted',
        description: 'Your Bungie.net account has limited API access.',
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        canRetry: false
      },
      'maintenance': {
        icon: 'Wrench',
        title: 'Service Maintenance',
        description: 'Bungie.net is currently undergoing maintenance.',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        canRetry: true
      },
      'rate_limit': {
        icon: 'Clock',
        title: 'Too Many Attempts',
        description: 'Please wait a moment before trying again.',
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        canRetry: true
      },
      'bad_request': {
        icon: 'AlertTriangle',
        title: 'Invalid Request',
        description: 'The request contains invalid data or parameters.',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        canRetry: true
      },
      'token_invalid': {
        icon: 'Key',
        title: 'Token Issue',
        description: 'Your authentication token is invalid or expired.',
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        canRetry: true
      },
      'validation_error': {
        icon: 'XCircle',
        title: 'Validation Failed',
        description: 'The provided information does not meet requirements.',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        canRetry: true
      },
      'unsupported_platform': {
        icon: 'AlertTriangle',
        title: 'Platform Not Supported',
        description: 'Only Bungie.net authentication is currently supported.',
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        canRetry: false
      },
      'state_validation_failed': {
        icon: 'ShieldAlert',
        title: 'Security Validation Failed',
        description: 'The authentication process was interrupted or took too long. This is a security measure to protect your account.',
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        canRetry: true
      },
      'token_exchange_failed': {
        icon: 'KeyRound',
        title: 'Authentication Expired',
        description: 'The authorization code has expired. Please start the authentication process again.',
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        canRetry: true
      },
      'callback_processing_failed': {
        icon: 'AlertCircle',
        title: 'Processing Failed',
        description: 'There was an error processing your authentication. Please try again.',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        canRetry: true
      },
      'initiation_failed': {
        icon: 'Settings',
        title: 'Setup Issue',
        description: 'Failed to start authentication. Please check your browser settings and allow popups.',
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        canRetry: true
      },
      'default': {
        icon: 'AlertCircle',
        title: 'Something went wrong',
        description: 'An unexpected error occurred. Please try again.',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        canRetry: true
      }
    };

    return errorMap?.[errorType] || errorMap?.['default'];
  };

  const errorInfo = getErrorInfo(error?.type || 'default');

  return (
    <div className="bg-card border border-border rounded-lg p-8 w-full max-w-md mx-auto shadow-lg">
      <div className="text-center">
        {/* Error Icon */}
        <div className={`w-16 h-16 ${errorInfo?.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
          <Icon name={errorInfo?.icon} size={32} className={errorInfo?.color} />
        </div>

        {/* Title and Description */}
        <h2 className="text-xl font-bold text-foreground mb-2">{errorInfo?.title}</h2>
        <p className="text-sm text-muted-foreground mb-6">{errorInfo?.description}</p>

        {/* Error Details (if available) */}
        {error && (
          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-sm font-medium text-foreground mb-2">Error Details:</h3>
            <div className="space-y-1 text-xs text-muted-foreground">
              {error?.code && (
                <div><strong>Code:</strong> {error?.code}</div>
              )}
              {error?.message && (
                <div><strong>Message:</strong> {error?.message}</div>
              )}
              {error?.timestamp && (
                <div><strong>Time:</strong> {new Date(error?.timestamp)?.toLocaleTimeString()}</div>
              )}
            </div>
          </div>
        )}

        {/* Recovery Suggestions */}
        {error?.recoveryActions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-sm font-medium text-blue-900 mb-2">💡 What you can do:</h3>
            <ul className="space-y-1 text-xs text-blue-800">
              {error.recoveryActions.clearState && (
                <li>• Authentication state has been cleared for a fresh start</li>
              )}
              {error.recoveryActions.waitBeforeRetry && (
                <li>• Wait a moment before trying again to avoid rate limits</li>
              )}
              {error.type === 'state_validation_failed' && (
                <li>• Make sure to complete the authentication process without switching tabs</li>
              )}
              {error.type === 'initiation_failed' && (
                <li>• Enable popups for this site in your browser settings</li>
              )}
              {error.details?.networkIssue && (
                <li>• Check your internet connection and try again</li>
              )}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {errorInfo?.canRetry && (
            <Button
              onClick={() => {
                // Add delay for rate-limited errors
                if (error?.recoveryActions?.waitBeforeRetry) {
                  setTimeout(onRetry, 2000);
                } else {
                  onRetry();
                }
              }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={error?.recoveryActions?.waitBeforeRetry}
            >
              <Icon name="RotateCcw" size={16} className="mr-2" />
              {error?.recoveryActions?.waitBeforeRetry ? 'Please wait...' : 'Try Again'}
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={onGoBack}
            className="w-full"
          >
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Go Back
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground mb-2">
            Still having trouble?
          </p>
          <a
            href="#"
            className="text-xs text-primary hover:text-primary/80 underline"
            onClick={(e) => {
              e?.preventDefault();
              // Could open support modal or navigate to help page
            }}
          >
            Contact support or view troubleshooting guide
          </a>
        </div>

        {/* Error-Specific Help */}
        {error?.type === 'network' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Tip:</strong> Check your internet connection and try disabling any VPN or proxy.
            </p>
          </div>
        )}

        {error?.type === 'rate_limit' && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg">
            <p className="text-xs text-amber-700">
              <strong>Tip:</strong> Please wait 5-10 minutes before attempting to connect again.
            </p>
          </div>
        )}

        {error?.type === 'bad_request' && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <div className="text-xs text-red-700 space-y-1">
              <p><strong>Common causes:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                {error?.details?.invalidToken && <li>Invalid or expired authentication token</li>}
                {error?.details?.invalidMembership && <li>Invalid membership type or ID format</li>}
                {error?.details?.missingParams && <li>Required parameters are missing</li>}
                {error?.details?.invalidFormat && <li>Data format doesn't match requirements</li>}
                {!error?.details && <li>Request parameters may be incorrect or malformed</li>}
              </ul>
            </div>
          </div>
        )}

        {error?.type === 'token_invalid' && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg">
            <p className="text-xs text-amber-700">
              <strong>Tip:</strong> Try logging out and logging back in to refresh your authentication.
            </p>
          </div>
        )}

        {error?.type === 'validation_error' && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <p className="text-xs text-red-700">
              <strong>Tip:</strong> Please check that all required fields are filled correctly and try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorState;