import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
  showDetails: boolean;
}

export class SecureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for security audit
    this.logSecurityError(error, errorInfo);
    
    // Update state with error details
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Call parent error handler if provided
    this.props.onError?.(error, errorInfo);

    // Send to crash reporting service in production
    if (__DEV__ === false) {
      this.reportToCrashlytics(error, errorInfo);
    }
  }

  logSecurityError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorBoundary: 'SecureErrorBoundary',
        errorCount: this.state.errorCount + 1,
      };

      // Store in AsyncStorage for debugging
      const logs = await AsyncStorage.getItem('error_logs');
      const logList = logs ? JSON.parse(logs) : [];
      logList.push(errorLog);

      // Keep only last 50 errors
      const trimmedLogs = logList.slice(-50);
      await AsyncStorage.setItem('error_logs', JSON.stringify(trimmedLogs));

      console.error('SecureErrorBoundary caught error:', errorLog);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  };

  reportToCrashlytics = (error: Error, errorInfo: ErrorInfo) => {
    // In production, this would send to a crash reporting service
    // Example: Sentry, Bugsnag, Firebase Crashlytics
    console.log('Reporting to crash service:', { error, errorInfo });
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  handleReload = () => {
    // In a real app, this might trigger a full app reload
    this.handleReset();
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails,
    }));
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      const ChicRebelPalette = {
        primary: '#FF6B35',
        secondary: '#D4AF37',
        accent: '#E85D75',
        dark: '#1A1A1A',
        lightGray: '#F3F4F6',
        white: '#FFFFFF',
      };

      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: ChicRebelPalette.lightGray }}>
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1 }}
            className="flex-1"
          >
            <View className="flex-1 items-center justify-center p-6">
              {/* Error Icon */}
              <View 
                className="w-24 h-24 rounded-full items-center justify-center mb-6"
                style={{ backgroundColor: `${ChicRebelPalette.accent}20` }}
              >
                <Ionicons name="warning" size={48} color={ChicRebelPalette.accent} />
              </View>

              {/* Error Title */}
              <Text className="text-2xl font-bold text-center mb-2" style={{ color: ChicRebelPalette.dark }}>
                Oops! Une erreur est survenue
              </Text>

              {/* Error Message */}
              <Text className="text-base text-center text-gray-600 mb-6 px-4">
                Nous avons rencontré un problème inattendu. Notre équipe a été notifiée et travaille sur une solution.
              </Text>

              {/* Error Count Badge */}
              {this.state.errorCount > 1 && (
                <View className="px-3 py-1 rounded-full mb-4" style={{ backgroundColor: `${ChicRebelPalette.warning}20` }}>
                  <Text className="text-xs font-medium" style={{ color: ChicRebelPalette.warning }}>
                    Erreur {this.state.errorCount} dans cette session
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View className="w-full max-w-sm space-y-3">
                {/* Retry Button */}
                <Pressable
                  onPress={this.handleReset}
                  className="w-full py-3 rounded-xl items-center"
                  style={{ backgroundColor: ChicRebelPalette.primary }}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="refresh" size={20} color="white" />
                    <Text className="ml-2 text-white font-bold">Réessayer</Text>
                  </View>
                </Pressable>

                {/* Reload App Button */}
                <Pressable
                  onPress={this.handleReload}
                  className="w-full py-3 rounded-xl items-center border"
                  style={{ borderColor: ChicRebelPalette.primary }}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="reload" size={20} color={ChicRebelPalette.primary} />
                    <Text className="ml-2 font-bold" style={{ color: ChicRebelPalette.primary }}>
                      Recharger l'application
                    </Text>
                  </View>
                </Pressable>

                {/* Show Details Button (Dev Mode) */}
                {__DEV__ && (
                  <Pressable
                    onPress={this.toggleDetails}
                    className="w-full py-3 rounded-xl items-center"
                    style={{ backgroundColor: ChicRebelPalette.lightGray }}
                  >
                    <View className="flex-row items-center">
                      <Ionicons 
                        name={this.state.showDetails ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color={ChicRebelPalette.dark} 
                      />
                      <Text className="ml-2 font-medium" style={{ color: ChicRebelPalette.dark }}>
                        {this.state.showDetails ? 'Masquer' : 'Afficher'} les détails techniques
                      </Text>
                    </View>
                  </Pressable>
                )}
              </View>

              {/* Error Details (Dev Mode) */}
              {__DEV__ && this.state.showDetails && this.state.error && (
                <View className="w-full mt-6 p-4 rounded-xl" style={{ backgroundColor: ChicRebelPalette.white }}>
                  <Text className="font-bold mb-2" style={{ color: ChicRebelPalette.accent }}>
                    Message d'erreur:
                  </Text>
                  <Text className="text-sm mb-4 font-mono" style={{ color: ChicRebelPalette.dark }}>
                    {this.state.error.message}
                  </Text>

                  {this.state.error.stack && (
                    <>
                      <Text className="font-bold mb-2" style={{ color: ChicRebelPalette.accent }}>
                        Stack trace:
                      </Text>
                      <ScrollView 
                        horizontal
                        className="max-h-32"
                        style={{ backgroundColor: ChicRebelPalette.lightGray }}
                      >
                        <Text className="text-xs p-2 font-mono" style={{ color: ChicRebelPalette.dark }}>
                          {this.state.error.stack}
                        </Text>
                      </ScrollView>
                    </>
                  )}
                </View>
              )}

              {/* Security Notice */}
              <View className="flex-row items-center mt-8">
                <Ionicons name="shield-checkmark" size={16} color={ChicRebelPalette.secondary} />
                <Text className="ml-2 text-xs" style={{ color: ChicRebelPalette.secondary }}>
                  Erreur capturée et sécurisée • ID: {Date.now().toString(36)}
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for functional components
export const withSecureErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <SecureErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </SecureErrorBoundary>
  );

  WrappedComponent.displayName = `withSecureErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
};