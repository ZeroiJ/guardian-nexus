import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BungieAuthService from '../../services/bungieAuth';
import Icon from '../../components/AppIcon';
import logger from '../../utils/logger';
import { formatUserError, GuardianError, setupGlobalErrorHandling } from '../../utils/errorHandler';

const BungieCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Setup global error handling
    setupGlobalErrorHandling();
    
    const processCallback = async () => {
      try {
        const code = searchParams?.get('code');
        const state = searchParams?.get('state');
        const error = searchParams?.get('error');

        if (error) {
          setStatus('error');
          setMessage(`Authorization error: ${error}`);
          return;
        }

        if (!code || !state) {
          setStatus('error');
          setMessage('Missing required authorization parameters');
          return;
        }

        setMessage('Processing your authorization...');

        // Handle OAuth callback using BungieAuthService
        const result = await BungieAuthService.handleOAuthCallback(code, state);

        if (result?.success) {
          setStatus('success');
          setMessage('Successfully connected to Bungie.net!');
          
          // Refresh auth context to update user state
          try {
            await refreshAuth();
          } catch (authError) {
            console.warn('Auth context refresh failed, but OAuth was successful:', authError);
          }
          
          // Redirect to dashboard after success
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(result?.error || 'Failed to complete authorization');
        }
      } catch (err) {
        logger.oauthError('callback component processing', err, {
          url: window.location.href,
          search: searchParams.toString(),
          component: 'BungieCallback',
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        });
        
        setStatus('error');
        
        // Enhanced error categorization with recovery mechanisms
        let errorType = 'callback_error';
        let errorMessage = formatUserError(err);
        let canRetry = true;
        let shouldClearState = false;
        
        if (err instanceof GuardianError) {
          switch (err.code) {
            case 'BAD_REQUEST':
              errorType = 'bad_request';
              errorMessage = 'Invalid authorization parameters. Please try connecting again.';
              shouldClearState = true;
              break;
            case 'UNAUTHORIZED':
              errorType = 'auth_failed';
              errorMessage = 'Authorization was denied or expired. Please try again.';
              shouldClearState = true;
              break;
            case 'FORBIDDEN':
              errorType = 'account_restricted';
              errorMessage = 'Your account may have restricted API access.';
              canRetry = false;
              break;
            case 'RATE_LIMITED':
              errorType = 'rate_limit';
              errorMessage = 'Too many connection attempts. Please wait a moment before retrying.';
              canRetry = true;
              break;
            case 'NETWORK_ERROR':
              errorType = 'network';
              errorMessage = 'Connection failed. Please check your internet connection.';
              canRetry = true;
              break;
            case 'OAUTH_STATE_VALIDATION_FAILED':
              errorType = 'state_validation_failed';
              errorMessage = 'Security validation failed. This usually happens when the authentication process is interrupted or takes too long.';
              shouldClearState = true;
              canRetry = true;
              break;
            case 'OAUTH_TOKEN_EXCHANGE_FAILED':
              errorType = 'token_exchange_failed';
              errorMessage = 'Failed to complete authentication. The authorization code may have expired.';
              shouldClearState = true;
              canRetry = true;
              break;
            case 'OAUTH_CALLBACK_PROCESSING_FAILED':
              errorType = 'callback_processing_failed';
              errorMessage = 'Authentication processing failed. Please try again.';
              canRetry = true;
              break;
            case 'OAUTH_INITIATION_FAILED':
              errorType = 'initiation_failed';
              errorMessage = 'Failed to start authentication process. Please check your browser settings.';
              canRetry = true;
              break;
          }
        }
        
        // Check for common error patterns (moved outside to fix scope issue)
        const errMsg = err?.message?.toLowerCase() || '';
        if (!errorType || errorType === 'unknown') {
          if (errMsg.includes('400') || errMsg.includes('bad request')) {
            errorType = 'bad_request';
            errorMessage = 'Invalid request data. Please try connecting again.';
          } else if (errMsg.includes('token') || errMsg.includes('invalid_grant')) {
            errorType = 'token_invalid';
            errorMessage = 'Authorization code expired. Please try connecting again.';
          }
        }
        
        // Store error details for ErrorState component
        setMessage(errorMessage);
        
        // Clear OAuth state if needed for fresh retry
        if (shouldClearState) {
          try {
            localStorage.removeItem('oauth_state');
            localStorage.removeItem('oauth_code_verifier');
            sessionStorage.removeItem('bungie_auth_redirect');
          } catch (clearError) {
            console.warn('Failed to clear OAuth state:', clearError);
          }
        }
        
        // Store enhanced error context with recovery information
        window.__CALLBACK_ERROR__ = {
          type: errorType,
          message: errorMessage,
          code: err?.code || err?.status,
          timestamp: Date.now(),
          canRetry,
          shouldClearState,
          details: {
            invalidToken: errMsg.includes('token') || errMsg.includes('invalid_grant'),
            invalidParams: errMsg.includes('400') || errMsg.includes('bad request'),
            networkIssue: errMsg.includes('network') || errMsg.includes('fetch'),
            stateValidationFailed: errorType === 'state_validation_failed',
            tokenExchangeFailed: errorType === 'token_exchange_failed'
          },
          recoveryActions: {
            clearState: shouldClearState,
            retryRecommended: canRetry,
            waitBeforeRetry: errorType === 'rate_limit'
          }
        };
      }
    };

    processCallback();
  }, [searchParams, refreshAuth, navigate]);

  const handleRetry = () => {
    navigate('/authentication-authorization');
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Icon name="Loader2" size={48} className="text-primary animate-spin" />;
      case 'success':
        return <Icon name="CheckCircle" size={48} className="text-green-600" />;
      case 'error':
        return <Icon name="XCircle" size={48} className="text-red-600" />;
      default:
        return <Icon name="AlertCircle" size={48} className="text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'bg-primary/10';
      case 'success':
        return 'bg-green-100';
      case 'error':
        return 'bg-red-100';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg p-8 w-full max-w-md mx-auto shadow-lg">
        <div className="text-center">
          {/* Status Icon */}
          <div className={`w-20 h-20 ${getStatusColor()} rounded-full flex items-center justify-center mx-auto mb-6`}>
            {getStatusIcon()}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {status === 'processing' && 'Processing...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Connection Failed'}
          </h1>

          {/* Message */}
          <p className="text-muted-foreground mb-6">{message}</p>

          {/* Action Buttons */}
          {status === 'error' && (
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-md transition-colors"
              >
                <Icon name="RotateCcw" size={16} className="mr-2 inline" />
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-muted hover:bg-muted/80 text-muted-foreground py-2 px-4 rounded-md transition-colors"
              >
                <Icon name="Home" size={16} className="mr-2 inline" />
                Go Home
              </button>
            </div>
          )}

          {status === 'success' && (
            <p className="text-sm text-muted-foreground">
              Redirecting to dashboard...
            </p>
          )}

          {status === 'processing' && (
            <div className="space-y-3">
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
              <p className="text-sm text-muted-foreground">
                Please wait while we complete the connection
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BungieCallback;