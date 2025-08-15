import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SubscriptionPlan,
  UserSubscription,
  PaymentMethod,
  Transaction,
  PaymentIntent,
  Customer,
  RevenueMetrics,
  PaymentError,
  QuebecTaxInfo,
  SubscriptionTier,
  PaymentStatus
} from '../types/payment';

interface PaymentState {
  // Subscription data
  currentSubscription: UserSubscription | null;
  availablePlans: SubscriptionPlan[];
  paymentMethods: PaymentMethod[];
  customer: Customer | null;
  
  // Transaction history
  transactions: Transaction[];
  
  // UI state
  isLoading: boolean;
  error: PaymentError | null;
  
  // Current payment intent for processing
  currentPaymentIntent: PaymentIntent | null;
  
  // Revenue metrics (admin only)
  revenueMetrics: RevenueMetrics | null;
  
  // Actions
  setSubscription: (subscription: UserSubscription | null) => void;
  setPaymentMethods: (methods: PaymentMethod[]) => void;
  addPaymentMethod: (method: PaymentMethod) => void;
  removePaymentMethod: (methodId: string) => void;
  setDefaultPaymentMethod: (methodId: string) => void;
  setCustomer: (customer: Customer | null) => void;
  addTransaction: (transaction: Transaction) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setCurrentPaymentIntent: (intent: PaymentIntent | null) => void;
  setRevenueMetrics: (metrics: RevenueMetrics | null) => void;
  
  // Loading and error management
  setLoading: (loading: boolean) => void;
  setError: (error: PaymentError | null) => void;
  clearError: () => void;
  
  // Helper functions
  getSubscriptionStatus: () => string;
  isSubscriptionActive: () => boolean;
  hasValidPaymentMethod: () => boolean;
  calculateQuebecTax: (amount: number) => QuebecTaxInfo;
  getPlanByTier: (tier: SubscriptionTier) => SubscriptionPlan | null;
  
  // Reset function
  resetPaymentState: () => void;
}

// Quebec tax rates (2024)
const QUEBEC_GST_RATE = 0.05; // 5% GST
const QUEBEC_QST_RATE = 0.09975; // 9.975% QST

// Subscription plans configuration
const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_base_monthly',
    tier: 'base',
    name: 'Formation de Base',
    nameEn: 'Basic Training',
    price: 2900, // $29.00 in cents
    currency: 'CAD',
    interval: 'month',
    stripePriceId: process.env.EXPO_PUBLIC_STRIPE_BASE_PRICE_ID || '',
    stripeProductId: process.env.EXPO_PUBLIC_STRIPE_BASE_PRODUCT_ID || '',
    features: [
      'Accès à 5 formations par mois',
      'Support par email',
      'Certificats de base',
      'Accès mobile'
    ],
    featuresEn: [
      'Access to 5 courses per month',
      'Email support',
      'Basic certificates',
      'Mobile access'
    ],
    maxFormations: 5,
    maxAteliers: 2,
    priority: 3
  },
  {
    id: 'plan_pro_monthly',
    tier: 'pro',
    name: 'Formation Professionnelle',
    nameEn: 'Professional Training',
    price: 7900, // $79.00 in cents
    currency: 'CAD',
    interval: 'month',
    stripePriceId: process.env.EXPO_PUBLIC_STRIPE_PRO_PRICE_ID || '',
    stripeProductId: process.env.EXPO_PUBLIC_STRIPE_PRO_PRODUCT_ID || '',
    features: [
      'Accès illimité aux formations',
      'Support prioritaire',
      'Certificats professionnels',
      'Accès aux ateliers pratiques',
      'Suivi personnalisé'
    ],
    featuresEn: [
      'Unlimited course access',
      'Priority support',
      'Professional certificates',
      'Practical workshop access',
      'Personal tracking'
    ],
    maxFormations: -1, // unlimited
    maxAteliers: 10,
    priority: 2,
    isPopular: true
  },
  {
    id: 'plan_elite_monthly',
    tier: 'elite',
    name: 'Formation Elite',
    nameEn: 'Elite Training',
    price: 19900, // $199.00 in cents
    currency: 'CAD',
    interval: 'month',
    stripePriceId: process.env.EXPO_PUBLIC_STRIPE_ELITE_PRICE_ID || '',
    stripeProductId: process.env.EXPO_PUBLIC_STRIPE_ELITE_PRODUCT_ID || '',
    features: [
      'Accès illimité à tout le contenu',
      'Support dédié 24/7',
      'Certificats avancés',
      'Ateliers illimités',
      'Mentorat personnalisé',
      'Accès aux formations exclusives',
      'Réseau professionnel'
    ],
    featuresEn: [
      'Unlimited access to all content',
      'Dedicated 24/7 support',
      'Advanced certificates',
      'Unlimited workshops',
      'Personal mentoring',
      'Exclusive training access',
      'Professional network'
    ],
    maxFormations: -1, // unlimited
    maxAteliers: -1, // unlimited
    priority: 1
  }
];

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSubscription: null,
      availablePlans: SUBSCRIPTION_PLANS,
      paymentMethods: [],
      customer: null,
      transactions: [],
      isLoading: false,
      error: null,
      currentPaymentIntent: null,
      revenueMetrics: null,
      
      // Actions
      setSubscription: (subscription) => set({ currentSubscription: subscription }),
      
      setPaymentMethods: (methods) => set({ paymentMethods: methods }),
      
      addPaymentMethod: (method) => set((state) => ({
        paymentMethods: [...state.paymentMethods, method]
      })),
      
      removePaymentMethod: (methodId) => set((state) => ({
        paymentMethods: state.paymentMethods.filter(m => m.id !== methodId)
      })),
      
      setDefaultPaymentMethod: (methodId) => set((state) => ({
        paymentMethods: state.paymentMethods.map(m => ({
          ...m,
          isDefault: m.id === methodId
        }))
      })),
      
      setCustomer: (customer) => set({ customer }),
      
      addTransaction: (transaction) => set((state) => ({
        transactions: [transaction, ...state.transactions]
      })),
      
      setTransactions: (transactions) => set({ transactions }),
      
      setCurrentPaymentIntent: (intent) => set({ currentPaymentIntent: intent }),
      
      setRevenueMetrics: (metrics) => set({ revenueMetrics: metrics }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      // Helper functions
      getSubscriptionStatus: () => {
        const subscription = get().currentSubscription;
        if (!subscription) return 'inactive';
        return subscription.status;
      },
      
      isSubscriptionActive: () => {
        const subscription = get().currentSubscription;
        if (!subscription) return false;
        return subscription.status === 'active' || subscription.status === 'trialing';
      },
      
      hasValidPaymentMethod: () => {
        const paymentMethods = get().paymentMethods;
        return paymentMethods.length > 0;
      },
      
      calculateQuebecTax: (amount: number): QuebecTaxInfo => {
        const subtotal = amount;
        const gst = Math.round(subtotal * QUEBEC_GST_RATE);
        const qst = Math.round(subtotal * QUEBEC_QST_RATE);
        const totalTax = gst + qst;
        const total = subtotal + totalTax;
        
        return {
          gst,
          qst,
          totalTax,
          subtotal,
          total
        };
      },
      
      getPlanByTier: (tier: SubscriptionTier): SubscriptionPlan | null => {
        const plans = get().availablePlans;
        return plans.find(plan => plan.tier === tier) || null;
      },
      
      resetPaymentState: () => set({
        currentSubscription: null,
        paymentMethods: [],
        customer: null,
        transactions: [],
        isLoading: false,
        error: null,
        currentPaymentIntent: null,
        revenueMetrics: null
      })
    }),
    {
      name: 'payment-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentSubscription: state.currentSubscription,
        paymentMethods: state.paymentMethods,
        customer: state.customer,
        transactions: state.transactions.slice(0, 50) // Keep only recent 50 transactions
      }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version < 1) {
          // For initial version, start with clean state
          return {
            currentSubscription: null,
            paymentMethods: [],
            customer: null,
            transactions: []
          };
        }
        return persistedState;
      }
    }
  )
);

// Helper functions for external use
export const formatPrice = (amount: number, currency: string = 'CAD'): string => {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency,
  }).format(amount / 100);
};

export const formatPriceEn = (amount: number, currency: string = 'CAD'): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
  }).format(amount / 100);
};

export const getPaymentMethodIcon = (brand: string): string => {
  const iconMap: Record<string, string> = {
    visa: '💳',
    mastercard: '💳',
    amex: '💳',
    discover: '💳',
    diners: '💳',
    jcb: '💳',
    unionpay: '💳'
  };
  return iconMap[brand.toLowerCase()] || '💳';
};