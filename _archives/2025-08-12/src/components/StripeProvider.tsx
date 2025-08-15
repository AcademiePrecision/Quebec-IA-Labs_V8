import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { StripeProvider as StripeRNProvider } from '@stripe/stripe-react-native';
import { initializeStripe } from '../api/stripe-service';

interface StripeProviderProps {
  children: React.ReactElement | React.ReactElement[];
}

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const [isStripeInitialized, setIsStripeInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    const initStripe = async () => {
      try {
        if (!STRIPE_PUBLISHABLE_KEY) {
          throw new Error('EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured');
        }

        const success = await initializeStripe();
        if (success) {
          setIsStripeInitialized(true);
          console.log('[StripeProvider] Stripe initialized successfully');
        } else {
          throw new Error('Failed to initialize Stripe');
        }
      } catch (error) {
        console.error('[StripeProvider] Stripe initialization failed:', error);
        setInitializationError(error instanceof Error ? error.message : 'Unknown error');
        
        // Show alert in development mode
        if (__DEV__) {
          Alert.alert(
            'Stripe Configuration Error',
            `Failed to initialize Stripe: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check your environment variables.`,
            [{ text: 'OK' }]
          );
        }
      }
    };

    initStripe();
  }, []);

  // If Stripe failed to initialize, still render children but payments won't work
  if (initializationError) {
    console.warn('[StripeProvider] Rendering without Stripe due to initialization error');
    return <>{children}</>;
  }

  // If Stripe isn't initialized yet, we can either show a loading state or render children
  // For now, we'll render children immediately since Stripe initialization is async
  return (
    <StripeRNProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.academie-precision"
      urlScheme="com.academie-precision"
    >
      {children}
    </StripeRNProvider>
  );
};