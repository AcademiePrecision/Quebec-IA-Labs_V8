// Configuration sécurisée avec fallback pour le développement
import * as Application from 'expo-application';

// Types de configuration
interface EnvironmentConfig {
  stripe: {
    publishableKey: string;
    merchantIdentifier: string;
    urlScheme: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
  };
  supabase: {
    url: string;
    anonKey: string;
  };
  security: {
    sessionTimeout: number; // en minutes
    maxLoginAttempts: number;
    tokenRefreshBuffer: number; // en secondes
  };
  features: {
    enableAnalytics: boolean;
    enableCrashReporting: boolean;
    enableBiometrics: boolean;
  };
}

// Configuration par environnement
const environments: Record<string, EnvironmentConfig> = {
  development: {
    stripe: {
      // Clé de test Stripe pour le développement (remplacer par votre vraie clé)
      publishableKey: 'pk_test_51J5kD2LqV8aFYrBa8xY8HVqfZcEz5VqYHJbPWL1234567890',
      merchantIdentifier: 'merchant.com.academie-precision.dev',
      urlScheme: 'com.academie-precision.dev',
    },
    api: {
      baseUrl: Application.extra?.API_BASE_URL_DEV || 'http://localhost:3000/api',
      timeout: 30000,
    },
    supabase: {
      // Configuration Supabase de développement (remplacer par vos vraies valeurs)
      url: 'https://xyzcompany.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyNzIwODU0MiwieHAiOjE5NzQzNjM3NDJ9.KYY8s',
    },
    security: {
      sessionTimeout: 60, // 60 minutes pour dev
      maxLoginAttempts: 10,
      tokenRefreshBuffer: 300, // 5 minutes
    },
    features: {
      enableAnalytics: false,
      enableCrashReporting: false,
      enableBiometrics: true,
    },
  },
  staging: {
    stripe: {
      publishableKey: Application.extra?.STRIPE_PUBLISHABLE_KEY_STAGING || '',
      merchantIdentifier: 'merchant.com.academie-precision.staging',
      urlScheme: 'com.academie-precision.staging',
    },
    api: {
      baseUrl: Application.extra?.API_BASE_URL_STAGING || 'https://staging-api.academie-precision.com/api',
      timeout: 20000,
    },
    supabase: {
      url: Application.extra?.SUPABASE_URL_STAGING || '',
      anonKey: Application.extra?.SUPABASE_ANON_KEY_STAGING || '',
    },
    security: {
      sessionTimeout: 30, // 30 minutes pour staging
      maxLoginAttempts: 5,
      tokenRefreshBuffer: 300,
    },
    features: {
      enableAnalytics: true,
      enableCrashReporting: true,
      enableBiometrics: true,
    },
  },
  production: {
    stripe: {
      publishableKey: Application.extra?.STRIPE_PUBLISHABLE_KEY || '',
      merchantIdentifier: 'merchant.com.academie-precision',
      urlScheme: 'com.academie-precision',
    },
    api: {
      baseUrl: Application.extra?.API_BASE_URL || 'https://api.academie-precision.com/api',
      timeout: 15000,
    },
    supabase: {
      url: Application.extra?.SUPABASE_URL || '',
      anonKey: Application.extra?.SUPABASE_ANON_KEY || '',
    },
    security: {
      sessionTimeout: 15, // 15 minutes pour production
      maxLoginAttempts: 3,
      tokenRefreshBuffer: 600, // 10 minutes
    },
    features: {
      enableAnalytics: true,
      enableCrashReporting: true,
      enableBiometrics: true,
    },
  },
};

// Déterminer l'environnement actuel
const getEnvironment = (): string => {
  // Toujours utiliser développement pour l'instant
  // TODO: Implémenter la détection d'environnement avec expo-constants
  if (__DEV__) {
    return 'development';
  }
  
  return 'production';
};

// Configuration active
const currentEnvironment = getEnvironment();
const config = environments[currentEnvironment];

// Validation de la configuration
const validateConfig = (): void => {
  const errors: string[] = [];
  
  if (!config.stripe.publishableKey) {
    errors.push('❌ Stripe publishable key manquante');
  }
  
  if (!config.supabase.url || !config.supabase.anonKey) {
    errors.push('❌ Configuration Supabase incomplète');
  }
  
  if (!config.api.baseUrl) {
    errors.push('❌ API base URL manquante');
  }
  
  if (errors.length > 0) {
    console.warn('[Environment] Configuration incomplète:', errors.join(', '));
    
    // En développement, on affiche un warning mais on continue
    if (__DEV__) {
      console.warn('[Environment] Mode développement - Configuration par défaut utilisée');
    } else {
      // En production, on lance une erreur
      throw new Error(`Configuration critique manquante: ${errors.join(', ')}`);
    }
  }
};

// Valider au démarrage
validateConfig();

// Export de la configuration
export const Environment = {
  ...config,
  
  // Méthodes utilitaires
  isDevelopment: currentEnvironment === 'development',
  isStaging: currentEnvironment === 'staging',
  isProduction: currentEnvironment === 'production',
  currentEnvironment,
  
  // Helper pour logger uniquement en dev
  debugLog: (message: string, data?: any) => {
    if (__DEV__) {
      console.log(`[${new Date().toISOString()}] ${message}`, data || '');
    }
  },
  
  // Helper pour les erreurs critiques
  logError: (error: Error, context?: string) => {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context,
      environment: currentEnvironment,
      timestamp: new Date().toISOString(),
    };
    
    if (__DEV__) {
      console.error('[Environment Error]', errorInfo);
    } else {
      // En production, envoyer à un service de monitoring
      // TODO: Intégrer Sentry ou autre service
      console.error('[Critical Error]', errorInfo.message);
    }
  },
};

export default Environment;