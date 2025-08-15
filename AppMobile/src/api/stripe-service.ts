import { 
  initStripe, 
  StripeProvider, 
  useStripe, 
  CardField,
  confirmPayment,
  createPaymentMethod,
  PaymentMethod as StripePaymentMethod,
  PaymentIntent as StripePaymentIntent
} from '@stripe/stripe-react-native';
import {
  UserSubscription,
  PaymentMethod,
  Transaction,
  PaymentIntent,
  Customer,
  SubscriptionPlan,
  PaymentError,
  SubscriptionTier,
  PaymentStatus
} from '../types/payment';
import { UserProfile } from '../types';
import Environment from '../config/environment';

// Security: Get Stripe configuration from secure environment
const STRIPE_CONFIG = Environment.stripe;
const API_BASE_URL = Environment.api.baseUrl;

// Validate configuration at initialization
if (!STRIPE_CONFIG.publishableKey) {
  Environment.logError(
    new Error('Stripe publishable key not configured'),
    'StripeService initialization'
  );
}

// Initialize Stripe with secure configuration
export const initializeStripe = async (): Promise<boolean> => {
  try {
    // Validate configuration before initialization
    if (!STRIPE_CONFIG.publishableKey) {
      throw new Error('Stripe configuration incomplete');
    }

    await initStripe({
      publishableKey: STRIPE_CONFIG.publishableKey,
      merchantIdentifier: STRIPE_CONFIG.merchantIdentifier,
      urlScheme: STRIPE_CONFIG.urlScheme,
      setReturnUrlSchemeOnAndroid: true,
    });
    
    Environment.debugLog('[StripeService] Stripe initialized successfully');
    return true;
  } catch (error) {
    Environment.logError(
      error as Error,
      'StripeService initialization failed'
    );
    return false;
  }
};

class StripeService {
  // Customer Management with enhanced security
  async createCustomer(profile: UserProfile): Promise<Customer | null> {
    try {
      // Add request timeout for security
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), Environment.api.timeout);

      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': this.generateRequestId(),
          'X-Client-Version': '1.0.0',
        },
        body: JSON.stringify({
          profileId: profile.id,
          email: profile.accountId,
          name: `${profile.accountId}`,
          metadata: {
            profileId: profile.id,
            userType: profile.userType,
            environment: Environment.currentEnvironment,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to create customer: ${response.statusText}`);
      }

      const customer: Customer = await response.json();
      return customer;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        Environment.logError(new Error('Request timeout'), 'createCustomer');
      } else {
        Environment.logError(error as Error, 'createCustomer');
      }
      return null;
    }
  }

  // Helper method for request ID generation
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async getCustomer(profileId: string): Promise<Customer | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/${profileId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Customer doesn't exist yet
        }
        throw new Error(`Failed to get customer: ${response.statusText}`);
      }

      const customer: Customer = await response.json();
      return customer;
    } catch (error) {
      console.error('[StripeService] Error getting customer:', error);
      return null;
    }
  }

  // Payment Methods
  async createPaymentMethod(
    cardDetails: any,
    billingDetails: any
  ): Promise<{ success: boolean; paymentMethod?: PaymentMethod; error?: PaymentError }> {
    try {
      const { paymentMethod, error } = await createPaymentMethod({
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails,
        },
      });

      if (error) {
        return {
          success: false,
          error: {
            type: 'card_error',
            message: error.message,
            code: error.code,
          },
        };
      }

      if (!paymentMethod) {
        return {
          success: false,
          error: {
            type: 'api_error',
            message: 'Failed to create payment method',
          },
        };
      }

      // Save payment method to backend
      const savedPaymentMethod = await this.savePaymentMethod(paymentMethod);
      
      return {
        success: true,
        paymentMethod: savedPaymentMethod,
      };
    } catch (error) {
      console.error('[StripeService] Error creating payment method:', error);
      return {
        success: false,
        error: {
          type: 'api_error',
          message: 'Failed to create payment method',
        },
      };
    }
  }

  private async savePaymentMethod(stripePaymentMethod: any): Promise<PaymentMethod> {
    const response = await fetch(`${API_BASE_URL}/payment-methods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stripePaymentMethodId: stripePaymentMethod.id,
        type: 'card',
        card: {
          brand: stripePaymentMethod.Card?.brand || '',
          last4: stripePaymentMethod.Card?.last4 || '',
          expMonth: stripePaymentMethod.Card?.expMonth || 0,
          expYear: stripePaymentMethod.Card?.expYear || 0,
        },
      }),
    });

    return await response.json();
  }

  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/payment-methods?customerId=${customerId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get payment methods: ${response.statusText}`);
      }

      const paymentMethods: PaymentMethod[] = await response.json();
      return paymentMethods;
    } catch (error) {
      console.error('[StripeService] Error getting payment methods:', error);
      return [];
    }
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
      });

      return response.ok;
    } catch (error) {
      console.error('[StripeService] Error deleting payment method:', error);
      return false;
    }
  }

  // Subscription Management
  async createSubscription(
    customerId: string,
    priceId: string,
    paymentMethodId?: string
  ): Promise<{ success: boolean; subscription?: UserSubscription; error?: PaymentError }> {
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          priceId,
          paymentMethodId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: {
            type: 'api_error',
            message: errorData.message || 'Failed to create subscription',
          },
        };
      }

      const subscription: UserSubscription = await response.json();
      return {
        success: true,
        subscription,
      };
    } catch (error) {
      console.error('[StripeService] Error creating subscription:', error);
      return {
        success: false,
        error: {
          type: 'api_error',
          message: 'Failed to create subscription',
        },
      };
    }
  }

  async getSubscription(profileId: string): Promise<UserSubscription | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions?profileId=${profileId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to get subscription: ${response.statusText}`);
      }

      const subscription: UserSubscription = await response.json();
      return subscription;
    } catch (error) {
      console.error('[StripeService] Error getting subscription:', error);
      return null;
    }
  }

  async cancelSubscription(subscriptionId: string, atPeriodEnd: boolean = true): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ atPeriodEnd }),
      });

      return response.ok;
    } catch (error) {
      console.error('[StripeService] Error canceling subscription:', error);
      return false;
    }
  }

  async updateSubscription(
    subscriptionId: string,
    newPriceId: string
  ): Promise<{ success: boolean; subscription?: UserSubscription; error?: PaymentError }> {
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId: newPriceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: {
            type: 'api_error',
            message: errorData.message || 'Failed to update subscription',
          },
        };
      }

      const subscription: UserSubscription = await response.json();
      return {
        success: true,
        subscription,
      };
    } catch (error) {
      console.error('[StripeService] Error updating subscription:', error);
      return {
        success: false,
        error: {
          type: 'api_error',
          message: 'Failed to update subscription',
        },
      };
    }
  }

  // One-time Payments (for formations and ateliers)
  async createPaymentIntent(
    amount: number,
    currency: string = 'CAD',
    metadata?: Record<string, string>
  ): Promise<{ success: boolean; paymentIntent?: PaymentIntent; error?: PaymentError }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payment-intents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          metadata,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: {
            type: 'api_error',
            message: errorData.message || 'Failed to create payment intent',
          },
        };
      }

      const paymentIntent: PaymentIntent = await response.json();
      return {
        success: true,
        paymentIntent,
      };
    } catch (error) {
      console.error('[StripeService] Error creating payment intent:', error);
      return {
        success: false,
        error: {
          type: 'api_error',
          message: 'Failed to create payment intent',
        },
      };
    }
  }

  async confirmPayment(
    clientSecret: string,
    paymentMethodId: string
  ): Promise<{ success: boolean; error?: PaymentError }> {
    try {
      const { error } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          paymentMethodId,
        },
      });

      if (error) {
        return {
          success: false,
          error: {
            type: 'card_error',
            message: error.message,
            code: error.code,
            declineCode: error.declineCode,
          },
        };
      }

      return { success: true };
    } catch (error) {
      console.error('[StripeService] Error confirming payment:', error);
      return {
        success: false,
        error: {
          type: 'api_error',
          message: 'Failed to confirm payment',
        },
      };
    }
  }

  // Transaction History
  async getTransactions(profileId: string, limit: number = 20): Promise<Transaction[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/transactions?profileId=${profileId}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to get transactions: ${response.statusText}`);
      }

      const transactions: Transaction[] = await response.json();
      return transactions;
    } catch (error) {
      console.error('[StripeService] Error getting transactions:', error);
      return [];
    }
  }

  // Helper Methods
  formatError(error: any): PaymentError {
    if (error.type) {
      return error as PaymentError;
    }

    return {
      type: 'api_error',
      message: error.message || 'An unknown error occurred',
    };
  }

  // Quebec tax calculation helper
  calculateQuebecTax(amount: number) {
    const gst = Math.round(amount * 0.05); // 5% GST
    const qst = Math.round(amount * 0.09975); // 9.975% QST
    const totalTax = gst + qst;
    const total = amount + totalTax;

    return {
      subtotal: amount,
      gst,
      qst,
      totalTax,
      total,
    };
  }
}

// Export singleton instance
export const stripeService = new StripeService();

// Export Stripe components for use in React components
export {
  StripeProvider,
  CardField,
  useStripe,
};