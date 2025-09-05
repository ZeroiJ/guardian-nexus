import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BungieAuthService from '../../services/bungieAuth';
import Icon from '../../components/AppIcon';

const BungieCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
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
        console.error('Callback processing error:', err);
        setStatus('error');
        
        // Provide more specific error messages based on error type
        let errorMessage = 'An unexpected error occurred';
        if (err?.message) {
          if (err.message.includes('state parameter')) {
            errorMessage = 'Security validation failed. Please try connecting again.';
          } else if (err.message.includes('Token exchange failed')) {
            errorMessage = 'Failed to complete authorization with Bungie. Please try again.';
          } else if (err.message.includes('CORS')) {
            errorMessage = 'Connection error. Please try again in a few moments.';
          } else if (err.message.includes('expired')) {
            errorMessage = 'Authorization session expired. Please start the connection process again.';
          } else {
            errorMessage = err.message;
          }
        }
        
        setMessage(errorMessage);
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