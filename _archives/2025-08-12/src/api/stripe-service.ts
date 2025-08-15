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

// Initialize Stripe
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

if (!STRIPE_PUBLISHABLE_KEY) {
  console.warn('[StripeService] EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY not found in environment');
}

// Initialize Stripe with your publishable key
export const initializeStripe = async (): Promise<boolean> => {
  try {
    await initStripe({
      publishableKey: STRIPE_PUBLISHABLE_KEY,
      merchantIdentifier: 'merchant.com.academie-precision',
      urlScheme: 'com.academie-precision',
      setReturnUrlSchemeOnAndroid: true,
    });
    console.log('[StripeService] Stripe initialized successfully');
    return true;
  } catch (error) {
    console.error('[StripeService] Failed to initialize Stripe:', error);
    return false;
  }
};

// Backend API base URL - In production, this should be your backend server
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

class StripeService {
  // Customer Management
  async createCustomer(profile: UserProfile): Promise<Customer | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId: profile.id,
          email: profile.accountId, // Using accountId as email reference
          name: `${profile.accountId}`, // You'll need to get actual name from account
          metadata: {
            profileId: profile.id,
            userType: profile.userType,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create customer: ${response.statusText}`);
      }

      const customer: Customer = await response.json();
      return customer;
    } catch (error) {
      console.error('[StripeService] Error creating customer:', error);
      return null;
    }
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