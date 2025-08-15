// ⚙️ CONFIGURATION PARTAGÉE SAVAGECO
// Configurations communes entre projets

export const API_CONFIG = {
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
};

export const MARCEL_CONFIG = {
  PHONE_NUMBER: '+15817101240',
  WEBHOOK_BASE_URL: process.env.MARCEL_WEBHOOK_URL || 'https://marcel-dev.replit.app',
  AI_MODEL_PRIMARY: 'claude-3-sonnet-20240229',
  AI_MODEL_FALLBACK: 'gpt-3.5-turbo',
  MAX_CONVERSATION_LENGTH: 10,
  SESSION_TIMEOUT_MINUTES: 30,
};

export const APP_CONFIG = {
  NAME: 'Académie Précision',
  VERSION: '8.1.0',
  CURRENCY: 'CAD',
  TIMEZONE: 'America/Montreal',
  SUPPORTED_LANGUAGES: ['fr', 'en'],
  DEFAULT_LANGUAGE: 'fr',
};

export const BUSINESS_CONSTANTS = {
  SUBSCRIPTION_TIERS: {
    BASIC: { price: 29, name: 'Étudiant' },
    PRO: { price: 79, name: 'Professionnel' },
    PREMIUM: { price: 199, name: 'Salon' },
  },
  COURSE_DURATIONS: {
    SHORT: 30, // 30 minutes
    MEDIUM: 60, // 1 heure  
    LONG: 120, // 2 heures
  },
  BOOKING_WINDOWS: {
    MIN_ADVANCE_HOURS: 2,
    MAX_ADVANCE_DAYS: 30,
    CANCELLATION_HOURS: 24,
  },
};

export const ERROR_CODES = {
  // Codes d'erreur communes
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTH_ERROR',
  PAYMENT_ERROR: 'PAYMENT_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  
  // Marcel AI spécifiques
  MARCEL_TIMEOUT: 'MARCEL_TIMEOUT',
  MARCEL_AI_ERROR: 'MARCEL_AI_ERROR',
  BOOKING_CONFLICT: 'BOOKING_CONFLICT',
  
  // App Mobile spécifiques
  COURSE_NOT_FOUND: 'COURSE_NOT_FOUND',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
  DEVICE_NOT_SUPPORTED: 'DEVICE_NOT_SUPPORTED',
};