export type SubscriptionTier = 'base' | 'pro' | 'elite';

export type SubscriptionStatus = 
  | 'active' 
  | 'inactive' 
  | 'canceled' 
  | 'past_due' 
  | 'unpaid' 
  | 'trialing';

export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'succeeded' 
  | 'failed' 
  | 'canceled';

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  nameEn: string;
  price: number; // in cents
  currency: 'CAD';
  interval: 'month' | 'year';
  stripePriceId: string;
  stripeProductId: string;
  features: string[];
  featuresEn: string[];
  maxFormations: number;
  maxAteliers: number;
  priority: number; // 1 = highest priority
  isPopular?: boolean;
}

export interface UserSubscription {
  id: string;
  profileId: string;
  subscriptionPlan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  stripePaymentMethodId: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  profileId: string;
  amount: number; // in cents
  currency: 'CAD';
  type: 'subscription' | 'formation' | 'atelier' | 'refund';
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  description: string;
  metadata?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentIntent {
  id: string;
  amount: number; // in cents
  currency: 'CAD';
  status: PaymentStatus;
  clientSecret: string;
  stripePaymentIntentId: string;
  metadata?: Record<string, string>;
  createdAt: string;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: 'CA';
}

export interface Customer {
  id: string;
  profileId: string;
  stripeCustomerId: string;
  email: string;
  name: string;
  phone?: string;
  address?: BillingAddress;
  defaultPaymentMethodId?: string;
  createdAt: string;
  updatedAt: string;
}

// Revenue tracking models for analytics
export interface RevenueMetrics {
  totalRevenue: number; // in cents
  monthlyRecurringRevenue: number; // in cents
  averageRevenuePerUser: number; // in cents
  subscriptionRevenue: number; // in cents
  formationRevenue: number; // in cents
  atelierRevenue: number; // in cents
  period: {
    start: string;
    end: string;
  };
}

// Error types for payment handling
export interface PaymentError {
  type: 'card_error' | 'invalid_request_error' | 'api_error' | 'authentication_error' | 'rate_limit_error';
  message: string;
  code?: string;
  param?: string;
  declineCode?: string;
}

// Quebec-specific payment requirements
export interface QuebecTaxInfo {
  gst: number; // 5% GST
  qst: number; // 9.975% QST
  totalTax: number;
  subtotal: number;
  total: number;
}