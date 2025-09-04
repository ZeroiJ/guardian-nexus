import React from 'react';
import Icon from '../../../components/AppIcon';

const LoadingState = ({ guardianData = null, isConnecting = false }) => {
  const getLoadingMessage = () => {
    if (isConnecting) {
      return {
        title: 'Connecting to Bungie.net...',
        subtitle: 'Please wait while we establish a secure connection',
        steps: [
          'Verifying your credentials',
          'Establishing secure connection',
          'Retrieving your Guardian data'
        ]
      };
    }

    if (guardianData) {
      return {
        title: 'Welcome back, Guardian!',
        subtitle: `Successfully connected as ${guardianData?.name}`,
        steps: [
          'Connection established ✓',
          'Guardian data retrieved ✓',
          'Redirecting to dashboard...'
        ]
      };
    }

    return {
      title: 'Loading...',
      subtitle: 'Please wait',
      steps: ['Loading your data...']
    };
  };

  const { title, subtitle, steps } = getLoadingMessage();
  const isSuccess = !!guardianData;

  return (
    <div className="bg-card border border-border rounded-lg p-8 w-full max-w-md mx-auto shadow-lg">
      <div className="text-center">
        {/* Loading Icon */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
          isSuccess ? 'bg-green-100' : 'bg-primary/10'
        }`}>
          {isSuccess ? (
            <Icon name="CheckCircle" size={32} className="text-green-600" />
          ) : (
            <Icon name="Loader2" size={32} className="text-primary animate-spin" />
          )}
        </div>

        {/* Title and Subtitle */}
        <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>

        {/* Progress Steps */}
        <div className="space-y-3 mb-6">
          {steps?.map((step, index) => (
            <div key={index} className="flex items-center text-sm">
              <div className={`w-2 h-2 rounded-full mr-3 ${
                step?.includes('✓') ? 'bg-green-500' : 
                isConnecting ? 'bg-primary animate-pulse' : 'bg-muted-foreground'
              }`} />
              <span className={`${
                step?.includes('✓') ? 'text-green-600' : 'text-muted-foreground'
              }`}>
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* Guardian Info (if available) */}
        {guardianData && (
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Icon name="User" size={20} className="text-primary" />
              </div>
              <div className="text-left">
                <div className="font-medium text-foreground">{guardianData?.name}</div>
                <div className="text-xs text-muted-foreground">{guardianData?.platform}</div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Bar */}
        {isConnecting && (
          <div className="w-full bg-muted rounded-full h-1 mb-4">
            <div className="bg-primary h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        )}

        {/* Status Message */}
        <p className="text-xs text-muted-foreground">
          {isSuccess 
            ? 'You will be redirected automatically in a few seconds...' :'This may take a moment. Please do not close this window.'
          }
        </p>
      </div>
    </div>
  );
};

export default LoadingState;