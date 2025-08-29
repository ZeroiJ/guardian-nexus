import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

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
      'unsupported_platform': {
        icon: 'AlertTriangle',
        title: 'Platform Not Supported',
        description: 'Only Bungie.net authentication is currently supported.',
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        canRetry: false
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

        {/* Action Buttons */}
        <div className="space-y-3">
          {errorInfo?.canRetry && (
            <Button
              onClick={onRetry}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Icon name="RotateCcw" size={16} className="mr-2" />
              Try Again
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
      </div>
    </div>
  );
};

export default ErrorState;