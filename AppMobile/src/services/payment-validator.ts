import { createClient } from '@supabase/supabase-js';
import Environment from '../config/environment';

// Types pour la validation des paiements
interface PaymentValidationRequest {
  userId: string;
  profileId: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
}

interface PaymentValidationResponse {
  valid: boolean;
  transactionId?: string;
  error?: string;
  timestamp: string;
}

interface SubscriptionValidation {
  userId: string;
  subscriptionId: string;
  tier: string;
  status: 'active' | 'cancelled' | 'past_due' | 'incomplete';
  validUntil: string;
}

// Classe de validation des paiements avec Supabase
export class PaymentValidator {
  private supabase;
  private validationCache: Map<string, { data: any; expiry: number }>;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Initialiser Supabase avec les credentials sécurisés
    this.supabase = createClient(
      Environment.supabase.url,
      Environment.supabase.anonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        global: {
          headers: {
            'X-Client-Version': '1.0.0',
          },
        },
      }
    );

    // Cache pour éviter les appels répétés
    this.validationCache = new Map();
  }

  /**
   * Valide un paiement avec le backend
   * Utilise un loading optimiste de 300ms max
   */
  async validatePayment(request: PaymentValidationRequest): Promise<PaymentValidationResponse> {
    const startTime = Date.now();
    
    try {
      // Vérifier le cache d'abord
      const cacheKey = `payment_${request.paymentIntentId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        Environment.debugLog('[PaymentValidator] Returning cached validation', { cacheKey });
        return cached;
      }

      // Appel à la fonction Edge Supabase avec timeout
      const { data, error } = await Promise.race([
        this.supabase.functions.invoke('validate-payment', {
          body: {
            ...request,
            timestamp: new Date().toISOString(),
            environment: Environment.currentEnvironment,
          },
        }),
        this.createTimeout(300), // 300ms timeout pour UX optimiste
      ]);

      if (error) {
        throw error;
      }

      const response: PaymentValidationResponse = {
        valid: data?.valid || false,
        transactionId: data?.transactionId,
        error: data?.error,
        timestamp: new Date().toISOString(),
      };

      // Mettre en cache si valide
      if (response.valid) {
        this.setCache(cacheKey, response);
      }

      // Log le temps de validation
      const duration = Date.now() - startTime;
      Environment.debugLog(`[PaymentValidator] Validation completed in ${duration}ms`);

      return response;
    } catch (error) {
      // En cas d'erreur ou de timeout, retourner une validation optimiste
      // mais marquer pour revalidation asynchrone
      if (this.isTimeoutError(error)) {
        this.scheduleAsyncValidation(request);
        return {
          valid: true, // Validation optimiste
          transactionId: `temp_${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
      }

      Environment.logError(error as Error, 'PaymentValidator.validatePayment');
      return {
        valid: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Valide l'état d'un abonnement
   */
  async validateSubscription(userId: string, subscriptionId: string): Promise<SubscriptionValidation | null> {
    try {
      const cacheKey = `subscription_${subscriptionId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const { data, error } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('stripe_subscription_id', subscriptionId)
        .single();

      if (error) {
        throw error;
      }

      const validation: SubscriptionValidation = {
        userId: data.user_id,
        subscriptionId: data.stripe_subscription_id,
        tier: data.tier,
        status: data.status,
        validUntil: data.current_period_end,
      };

      this.setCache(cacheKey, validation);
      return validation;
    } catch (error) {
      Environment.logError(error as Error, 'PaymentValidator.validateSubscription');
      return null;
    }
  }

  /**
   * Enregistre une tentative de paiement pour audit
   */
  async logPaymentAttempt(
    userId: string,
    amount: number,
    success: boolean,
    metadata?: any
  ): Promise<void> {
    try {
      await this.supabase.from('payment_logs').insert({
        user_id: userId,
        amount,
        success,
        metadata,
        ip_address: await this.getClientIP(),
        user_agent: this.getUserAgent(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // Log silencieusement, ne pas bloquer le paiement
      Environment.debugLog('[PaymentValidator] Failed to log payment attempt', error);
    }
  }

  /**
   * Vérifie les limites de taux pour prévenir les abus
   */
  async checkRateLimit(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('check_payment_rate_limit', {
        p_user_id: userId,
        p_window_minutes: 5,
        p_max_attempts: 10,
      });

      if (error) {
        // En cas d'erreur, permettre par défaut (fail open)
        Environment.debugLog('[PaymentValidator] Rate limit check failed, allowing', error);
        return true;
      }

      return data?.allowed || false;
    } catch (error) {
      Environment.debugLog('[PaymentValidator] Rate limit check error', error);
      return true; // Fail open
    }
  }

  // Méthodes privées d'aide

  private createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), ms);
    });
  }

  private isTimeoutError(error: any): boolean {
    return error?.message === 'Timeout';
  }

  private scheduleAsyncValidation(request: PaymentValidationRequest): void {
    // Validation asynchrone en arrière-plan
    setTimeout(async () => {
      try {
        const { data, error } = await this.supabase.functions.invoke('validate-payment-async', {
          body: request,
        });

        if (error) {
          Environment.logError(error, 'Async payment validation failed');
        } else {
          Environment.debugLog('[PaymentValidator] Async validation completed', data);
        }
      } catch (error) {
        Environment.logError(error as Error, 'Async payment validation error');
      }
    }, 1000);
  }

  private getFromCache(key: string): any | null {
    const cached = this.validationCache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    this.validationCache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.validationCache.set(key, {
      data,
      expiry: Date.now() + this.CACHE_DURATION,
    });

    // Nettoyer le cache périodiquement
    if (this.validationCache.size > 100) {
      this.cleanCache();
    }
  }

  private cleanCache(): void {
    const now = Date.now();
    for (const [key, value] of this.validationCache.entries()) {
      if (value.expiry < now) {
        this.validationCache.delete(key);
      }
    }
  }

  private async getClientIP(): Promise<string> {
    // En React Native, on ne peut pas obtenir l'IP directement
    // Cela devrait être géré côté serveur
    return 'mobile-app';
  }

  private getUserAgent(): string {
    // Retourner des informations sur l'app
    return `CutClub-Mobile/${Environment.currentEnvironment}`;
  }
}

// Singleton pour usage global
export const paymentValidator = new PaymentValidator();