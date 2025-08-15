import { useAuthStore } from '../state/authStore';
import { usePaymentStore } from '../state/paymentStore';
import { stripeService } from './stripe-service';
import { UserProfile } from '../types';
import { SubscriptionTier } from '../types/payment';

/**
 * Payment Integration Service
 * Connects the payment system with the existing authentication and user profile system
 */
class PaymentIntegrationService {
  /**
   * Initialize payment data for a user profile
   * Should be called when user logs in or switches profiles
   */
  async initializePaymentForProfile(profile: UserProfile): Promise<void> {
    try {
      const paymentStore = usePaymentStore.getState();
      paymentStore.setLoading(true);
      paymentStore.clearError();

      // Get or create customer
      let customer = await stripeService.getCustomer(profile.id);
      if (!customer) {
        customer = await stripeService.createCustomer(profile);
      }

      if (customer) {
        paymentStore.setCustomer(customer);

        // Load payment methods
        const paymentMethods = await stripeService.getPaymentMethods(customer.stripeCustomerId);
        paymentStore.setPaymentMethods(paymentMethods);

        // Load subscription
        const subscription = await stripeService.getSubscription(profile.id);
        paymentStore.setSubscription(subscription);

        // Load transaction history
        const transactions = await stripeService.getTransactions(profile.id);
        paymentStore.setTransactions(transactions);
      }

      paymentStore.setLoading(false);
    } catch (error) {
      console.error('[PaymentIntegration] Error initializing payment for profile:', error);
      const paymentStore = usePaymentStore.getState();
      paymentStore.setError({
        type: 'api_error',
        message: 'Failed to initialize payment data'
      });
      paymentStore.setLoading(false);
    }
  }

  /**
   * Clean up payment data when user logs out
   */
  async cleanupPaymentData(): Promise<void> {
    const paymentStore = usePaymentStore.getState();
    paymentStore.resetPaymentState();
  }

  /**
   * Subscribe to a plan
   */
  async subscribeToPlan(
    tier: SubscriptionTier,
    paymentMethodId?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const authState = useAuthStore.getState();
      const paymentState = usePaymentStore.getState();

      if (!authState.session?.activeProfile) {
        return {
          success: false,
          message: 'No active profile found'
        };
      }

      if (!paymentState.customer) {
        return {
          success: false,
          message: 'Customer not initialized'
        };
      }

      const plan = paymentState.getPlanByTier(tier);
      if (!plan) {
        return {
          success: false,
          message: 'Invalid subscription plan'
        };
      }

      paymentState.setLoading(true);
      paymentState.clearError();

      const result = await stripeService.createSubscription(
        paymentState.customer.stripeCustomerId,
        plan.stripePriceId,
        paymentMethodId
      );

      if (result.success && result.subscription) {
        paymentState.setSubscription(result.subscription);
        
        // Add transaction record
        const transaction = {
          id: Date.now().toString(),
          profileId: authState.session.activeProfile.id,
          amount: plan.price,
          currency: 'CAD' as const,
          type: 'subscription' as const,
          status: 'succeeded' as const,
          description: `Subscription: ${plan.name}`,
          metadata: {
            subscriptionId: result.subscription.stripeSubscriptionId,
            planTier: tier
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        paymentState.addTransaction(transaction);
        paymentState.setLoading(false);

        return {
          success: true,
          message: 'Subscription créé avec succès!'
        };
      } else {
        paymentState.setError(result.error || null);
        paymentState.setLoading(false);
        
        return {
          success: false,
          message: result.error?.message || 'Failed to create subscription'
        };
      }
    } catch (error) {
      console.error('[PaymentIntegration] Error subscribing to plan:', error);
      const paymentState = usePaymentStore.getState();
      paymentState.setError({
        type: 'api_error',
        message: 'Failed to create subscription'
      });
      paymentState.setLoading(false);

      return {
        success: false,
        message: 'Une erreur s\'est produite lors de la création de l\'abonnement'
      };
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(immediately: boolean = false): Promise<{ success: boolean; message: string }> {
    try {
      const paymentState = usePaymentStore.getState();
      
      if (!paymentState.currentSubscription) {
        return {
          success: false,
          message: 'No active subscription found'
        };
      }

      paymentState.setLoading(true);
      paymentState.clearError();

      const success = await stripeService.cancelSubscription(
        paymentState.currentSubscription.stripeSubscriptionId,
        !immediately
      );

      if (success) {
        // Update local subscription status
        const updatedSubscription = {
          ...paymentState.currentSubscription,
          cancelAtPeriodEnd: !immediately,
          status: immediately ? 'canceled' as const : paymentState.currentSubscription.status,
          updatedAt: new Date().toISOString()
        };
        
        paymentState.setSubscription(updatedSubscription);
        paymentState.setLoading(false);

        return {
          success: true,
          message: immediately ? 'Abonnement annulé immédiatement' : 'Abonnement sera annulé à la fin de la période'
        };
      } else {
        paymentState.setLoading(false);
        return {
          success: false,
          message: 'Failed to cancel subscription'
        };
      }
    } catch (error) {
      console.error('[PaymentIntegration] Error canceling subscription:', error);
      const paymentState = usePaymentStore.getState();
      paymentState.setError({
        type: 'api_error',
        message: 'Failed to cancel subscription'
      });
      paymentState.setLoading(false);

      return {
        success: false,
        message: 'Une erreur s\'est produite lors de l\'annulation'
      };
    }
  }

  /**
   * Change subscription plan
   */
  async changeSubscriptionPlan(newTier: SubscriptionTier): Promise<{ success: boolean; message: string }> {
    try {
      const paymentState = usePaymentStore.getState();
      
      if (!paymentState.currentSubscription) {
        return {
          success: false,
          message: 'No active subscription found'
        };
      }

      const newPlan = paymentState.getPlanByTier(newTier);
      if (!newPlan) {
        return {
          success: false,
          message: 'Invalid subscription plan'
        };
      }

      paymentState.setLoading(true);
      paymentState.clearError();

      const result = await stripeService.updateSubscription(
        paymentState.currentSubscription.stripeSubscriptionId,
        newPlan.stripePriceId
      );

      if (result.success && result.subscription) {
        paymentState.setSubscription(result.subscription);
        paymentState.setLoading(false);

        return {
          success: true,
          message: `Abonnement mis à jour vers ${newPlan.name}`
        };
      } else {
        paymentState.setError(result.error || null);
        paymentState.setLoading(false);
        
        return {
          success: false,
          message: result.error?.message || 'Failed to update subscription'
        };
      }
    } catch (error) {
      console.error('[PaymentIntegration] Error changing subscription plan:', error);
      const paymentState = usePaymentStore.getState();
      paymentState.setError({
        type: 'api_error',
        message: 'Failed to update subscription'
      });
      paymentState.setLoading(false);

      return {
        success: false,
        message: 'Une erreur s\'est produite lors de la mise à jour'
      };
    }
  }

  /**
   * Process one-time payment for formation or atelier
   */
  async processOneTimePayment(
    amount: number,
    description: string,
    type: 'formation' | 'atelier',
    metadata?: Record<string, string>
  ): Promise<{ success: boolean; message: string; clientSecret?: string }> {
    try {
      const authState = useAuthStore.getState();
      const paymentState = usePaymentStore.getState();

      if (!authState.session?.activeProfile) {
        return {
          success: false,
          message: 'No active profile found'
        };
      }

      paymentState.setLoading(true);
      paymentState.clearError();

      // Calculate Quebec taxes
      const taxInfo = paymentState.calculateQuebecTax(amount);

      const result = await stripeService.createPaymentIntent(
        taxInfo.total,
        'CAD',
        {
          profileId: authState.session.activeProfile.id,
          type,
          description,
          subtotal: amount.toString(),
          gst: taxInfo.gst.toString(),
          qst: taxInfo.qst.toString(),
          ...metadata
        }
      );

      if (result.success && result.paymentIntent) {
        paymentState.setCurrentPaymentIntent(result.paymentIntent);
        paymentState.setLoading(false);

        return {
          success: true,
          message: 'Payment intent created',
          clientSecret: result.paymentIntent.clientSecret
        };
      } else {
        paymentState.setError(result.error || null);
        paymentState.setLoading(false);
        
        return {
          success: false,
          message: result.error?.message || 'Failed to create payment intent'
        };
      }
    } catch (error) {
      console.error('[PaymentIntegration] Error processing one-time payment:', error);
      const paymentState = usePaymentStore.getState();
      paymentState.setError({
        type: 'api_error',
        message: 'Failed to process payment'
      });
      paymentState.setLoading(false);

      return {
        success: false,
        message: 'Une erreur s\'est produite lors du traitement du paiement'
      };
    }
  }

  /**
   * Check if user has access to a feature based on their subscription
   */
  hasFeatureAccess(feature: 'formations' | 'ateliers' | 'unlimited_content' | 'priority_support' | 'mentoring'): boolean {
    const paymentState = usePaymentStore.getState();
    
    if (!paymentState.isSubscriptionActive()) {
      return false;
    }

    const subscription = paymentState.currentSubscription;
    if (!subscription) {
      return false;
    }

    const tier = subscription.subscriptionPlan.tier;

    switch (feature) {
      case 'formations':
        return true; // All tiers have access to formations
      case 'ateliers':
        return tier === 'pro' || tier === 'elite';
      case 'unlimited_content':
        return tier === 'pro' || tier === 'elite';
      case 'priority_support':
        return tier === 'pro' || tier === 'elite';
      case 'mentoring':
        return tier === 'elite';
      default:
        return false;
    }
  }

  /**
   * Get remaining formations for current month (for base tier)
   */
  getRemainingFormations(): number {
    const paymentState = usePaymentStore.getState();
    
    if (!paymentState.isSubscriptionActive()) {
      return 0;
    }

    const subscription = paymentState.currentSubscription;
    if (!subscription) {
      return 0;
    }

    if (subscription.subscriptionPlan.tier !== 'base') {
      return -1; // Unlimited
    }

    // In a real implementation, you would track usage
    // For now, return the max allowed for base tier
    return subscription.subscriptionPlan.maxFormations;
  }
}

// Export singleton instance
export const paymentIntegration = new PaymentIntegrationService();