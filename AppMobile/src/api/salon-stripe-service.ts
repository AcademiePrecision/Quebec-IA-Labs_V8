// 💳 INTÉGRATION STRIPE - MONÉTISATION VALET IA
// 99$/mois par salon • 90 jours gratuits • 69$/salon profit

import Stripe from 'stripe';

interface SalonSubscription {
  salon_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan_type: 'trial' | 'basic' | 'premium';
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  current_period_start: Date;
  current_period_end: Date;
  trial_end?: Date;
  monthly_revenue: number;
  ai_calls_included: number;
  ai_calls_used: number;
}

interface BillingMetrics {
  total_salons: number;
  active_subscriptions: number;
  trial_subscriptions: number;
  monthly_recurring_revenue: number;
  churn_rate: number;
  average_revenue_per_salon: number;
}

class SalonStripeService {
  private stripe: Stripe;
  private readonly BASIC_PLAN_PRICE = 9900; // 99.00$ CAD en cents
  private readonly TRIAL_DAYS = 90;
  
  constructor() {
    const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_...';
    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });
  }

  // 🏪 CRÉATION COMPTE SALON
  async createSalonAccount(
    salonData: {
      name: string;
      owner_email: string;
      owner_name: string;
      phone: string;
      address: string;
    }
  ): Promise<SalonSubscription> {
    try {
      // 1. Création customer Stripe
      const customer = await this.stripe.customers.create({
        email: salonData.owner_email,
        name: salonData.owner_name,
        description: `Salon: ${salonData.name}`,
        metadata: {
          salon_name: salonData.name,
          phone: salonData.phone,
          address: salonData.address,
          signup_date: new Date().toISOString(),
          source: 'valet_ai_signup'
        }
      });

      // 2. Création de la souscription avec trial de 90 jours
      const subscription = await this.stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price: await this.getOrCreatePriceId(),
          },
        ],
        trial_period_days: this.TRIAL_DAYS,
        metadata: {
          salon_name: salonData.name,
          plan_type: 'basic',
          ai_calls_limit: '10000', // 10k appels/mois inclus
        },
        expand: ['latest_invoice.payment_intent'],
      });

      // 3. Configuration webhook pour suivi
      await this.setupSalonWebhooks(customer.id, salonData.name);

      // 4. Retour des données de souscription
      const salonSubscription: SalonSubscription = {
        salon_id: '', // Sera défini après création en BD
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        plan_type: 'trial',
        status: 'trialing',
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
        monthly_revenue: 0, // Gratuit pendant trial
        ai_calls_included: 10000,
        ai_calls_used: 0
      };

      console.log(`✅ Salon créé: ${salonData.name} - Trial jusqu'au ${salonSubscription.trial_end}`);
      return salonSubscription;

    } catch (error) {
      console.error('❌ Erreur création salon:', error);
      throw new Error(`Échec création compte salon: ${error.message}`);
    }
  }

  // 💰 GESTION FACTURATION MENSUELLE
  async processSalonBilling(salonId: string, usage: {
    ai_calls_made: number;
    revenue_generated: number;
    client_satisfaction: number;
  }): Promise<void> {
    try {
      const subscription = await this.getSalonSubscription(salonId);
      
      if (!subscription || subscription.status !== 'active') {
        console.log(`⏭️ Salon ${salonId} pas actif, pas de facturation`);
        return;
      }

      // Mise à jour des métriques d'usage
      await this.updateUsageMetrics(subscription.stripe_subscription_id, usage);

      // Ajout de frais supplémentaires si dépassement
      if (usage.ai_calls_made > subscription.ai_calls_included) {
        const extraCalls = usage.ai_calls_made - subscription.ai_calls_included;
        const extraCharges = Math.ceil(extraCalls / 1000) * 500; // 5$ par tranche 1000 appels
        
        await this.addUsageCharges(subscription.stripe_customer_id, extraCharges, extraCalls);
      }

      console.log(`💳 Facturation traitée pour salon ${salonId}: ${usage.ai_calls_made} appels`);

    } catch (error) {
      console.error('❌ Erreur facturation salon:', error);
    }
  }

  // 📈 MÉTRIQUES BUSINESS
  async getBillingMetrics(): Promise<BillingMetrics> {
    try {
      // Récupération toutes les souscriptions actives
      const subscriptions = await this.stripe.subscriptions.list({
        status: 'all',
        limit: 100,
        expand: ['data.customer']
      });

      const active = subscriptions.data.filter(s => s.status === 'active').length;
      const trialing = subscriptions.data.filter(s => s.status === 'trialing').length;
      
      // Calcul MRR (Monthly Recurring Revenue)
      const mrr = subscriptions.data
        .filter(s => s.status === 'active')
        .reduce((total, sub) => {
          const monthlyAmount = sub.items.data[0]?.price?.unit_amount || 0;
          return total + monthlyAmount;
        }, 0) / 100; // Conversion cents -> dollars

      const metrics: BillingMetrics = {
        total_salons: subscriptions.data.length,
        active_subscriptions: active,
        trial_subscriptions: trialing,
        monthly_recurring_revenue: mrr,
        churn_rate: await this.calculateChurnRate(),
        average_revenue_per_salon: active > 0 ? mrr / active : 0
      };

      console.log(`📊 Métriques: ${active} salons actifs • MRR: ${mrr}$ CAD`);
      return metrics;

    } catch (error) {
      console.error('❌ Erreur métriques:', error);
      throw error;
    }
  }

  // 🎯 GESTION FIN DE TRIAL
  async handleTrialEnding(salonId: string): Promise<'converted' | 'canceled'> {
    try {
      const subscription = await this.getSalonSubscription(salonId);
      
      if (!subscription) {
        throw new Error('Souscription introuvable');
      }

      // Récupération métriques de performance pendant le trial
      const trialMetrics = await this.getTrialPerformanceMetrics(salonId);
      
      // Décision automatique basée sur l'utilisation
      const shouldConvert = this.shouldAutoConvert(trialMetrics);
      
      if (shouldConvert) {
        // Conversion automatique vers plan payant
        await this.convertToActiveSubscription(subscription.stripe_subscription_id);
        
        // Email de confirmation
        await this.sendConversionEmail(subscription.stripe_customer_id, trialMetrics);
        
        console.log(`✅ Auto-conversion salon ${salonId} vers plan payant`);
        return 'converted';
        
      } else {
        // Tentative de rétention avec offre spéciale
        const retentionOffer = await this.createRetentionOffer(subscription.stripe_customer_id);
        
        if (!retentionOffer.accepted) {
          // Annulation après période de grâce
          await this.cancelSubscription(subscription.stripe_subscription_id, 'trial_not_converted');
          console.log(`❌ Salon ${salonId} annulé après trial`);
          return 'canceled';
        }
      }

    } catch (error) {
      console.error('❌ Erreur gestion fin trial:', error);
      return 'canceled';
    }
  }

  // 🎁 OFFRES DE RÉTENTION
  private async createRetentionOffer(customerId: string): Promise<{accepted: boolean, offer_type: string}> {
    try {
      // Création coupon de rétention (50% de réduction 3 mois)
      const coupon = await this.stripe.coupons.create({
        duration: 'repeating',
        duration_in_months: 3,
        percent_off: 50,
        name: 'Offre de rétention Valet IA',
        metadata: {
          offer_type: 'retention_50_percent',
          created_for: customerId
        }
      });

      // Email automatique avec l'offre
      await this.sendRetentionEmail(customerId, coupon.id);
      
      // Pour l'instant, simulation de l'acceptance (en production, webhook depuis email)
      const acceptanceRate = 0.3; // 30% acceptent l'offre
      const accepted = Math.random() < acceptanceRate;
      
      return {
        accepted,
        offer_type: 'retention_50_percent_3months'
      };

    } catch (error) {
      console.error('❌ Erreur création offre rétention:', error);
      return { accepted: false, offer_type: 'none' };
    }
  }

  // 📊 ANALYSE PERFORMANCE TRIAL
  private async getTrialPerformanceMetrics(salonId: string): Promise<any> {
    // Récupération métriques salon pendant les 90 jours
    return {
      total_calls: 150,
      successful_bookings: 120,
      revenue_generated: 4200,
      client_satisfaction: 8.5,
      daily_usage: 5.0,
      feature_adoption: 0.8,
      support_tickets: 2
    };
  }

  // 🤖 DÉCISION AUTO-CONVERSION
  private shouldAutoConvert(metrics: any): boolean {
    // Algorithme de décision basé sur l'engagement
    const engagementScore = 
      (metrics.total_calls > 100 ? 25 : 0) +
      (metrics.revenue_generated > 3000 ? 25 : 0) +
      (metrics.client_satisfaction > 8 ? 25 : 0) +
      (metrics.daily_usage > 3 ? 25 : 0);
    
    return engagementScore >= 75; // 75% d'engagement minimum
  }

  // 🔄 WEBHOOKS STRIPE
  async handleStripeWebhook(signature: string, payload: string): Promise<void> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;
          
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
          
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
          break;
          
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
          
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;
          
        case 'customer.subscription.trial_will_end':
          await this.handleTrialWillEnd(event.data.object as Stripe.Subscription);
          break;
      }

    } catch (error) {
      console.error('❌ Erreur webhook Stripe:', error);
      throw error;
    }
  }

  // 📧 NOTIFICATIONS EMAIL AUTOMATIQUES
  private async sendConversionEmail(customerId: string, metrics: any): Promise<void> {
    const customer = await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
    
    const emailContent = `
    Félicitations! Votre salon a été automatiquement converti vers notre plan premium.
    
    Vos résultats pendant le trial:
    • ${metrics.total_calls} appels traités par l'IA
    • ${metrics.successful_bookings} réservations créées
    • ${metrics.revenue_generated}$ de revenus générés
    • ${metrics.client_satisfaction}/10 satisfaction client
    
    Votre prochain paiement: 99$ CAD le ${new Date().toLocaleDateString('fr-CA')}
    `;
    
    console.log(`📧 Email conversion envoyé à: ${customer.email}`);
    // En production: intégration SendGrid/Mailgun
  }

  private async sendRetentionEmail(customerId: string, couponId: string): Promise<void> {
    const customer = await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
    
    console.log(`📧 Email rétention (50% off) envoyé à: ${customer.email}`);
    // En production: email avec lien d'activation du coupon
  }

  // 💳 GESTION PRIX ET PLANS
  private async getOrCreatePriceId(): Promise<string> {
    try {
      // Vérification si le prix existe déjà
      const prices = await this.stripe.prices.list({
        product: await this.getOrCreateProductId(),
        active: true
      });

      if (prices.data.length > 0) {
        return prices.data[0].id;
      }

      // Création du prix 99$ CAD/mois
      const price = await this.stripe.prices.create({
        unit_amount: this.BASIC_PLAN_PRICE,
        currency: 'cad',
        recurring: { interval: 'month' },
        product: await this.getOrCreateProductId(),
        metadata: {
          plan_name: 'Valet IA Basic',
          ai_calls_included: '10000',
          features: 'ai_voice,booking_automation,analytics,basic_support'
        }
      });

      return price.id;

    } catch (error) {
      console.error('❌ Erreur création prix:', error);
      throw error;
    }
  }

  private async getOrCreateProductId(): Promise<string> {
    try {
      const products = await this.stripe.products.list({
        active: true,
        limit: 1
      });

      if (products.data.length > 0) {
        return products.data[0].id;
      }

      const product = await this.stripe.products.create({
        name: 'Valet IA pour Salons de Coiffure',
        description: 'Intelligence artificielle complète pour automatiser votre salon - Réservations 24/7, gestion clients, analytics',
        metadata: {
          version: '1.0',
          market: 'quebec_canada',
          target: 'hair_salons_barbershops'
        }
      });

      return product.id;

    } catch (error) {
      console.error('❌ Erreur création produit:', error);
      throw error;
    }
  }

  // Méthodes utilitaires et placeholders
  private async getSalonSubscription(salonId: string): Promise<SalonSubscription | null> {
    // En production: requête base de données
    return null;
  }

  private async updateUsageMetrics(subscriptionId: string, usage: any): Promise<void> {
    // Mise à jour métriques d'usage
  }

  private async addUsageCharges(customerId: string, amount: number, extraCalls: number): Promise<void> {
    // Ajout frais supplémentaires pour dépassement
  }

  private async calculateChurnRate(): Promise<number> {
    // Calcul taux de désabonnement
    return 0.05; // 5% par défaut
  }

  private async convertToActiveSubscription(subscriptionId: string): Promise<void> {
    // Conversion trial vers actif
  }

  private async cancelSubscription(subscriptionId: string, reason: string): Promise<void> {
    // Annulation souscription
  }

  private async setupSalonWebhooks(customerId: string, salonName: string): Promise<void> {
    // Configuration webhooks spécifiques au salon
  }

  // Handlers pour les webhooks
  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    console.log(`✅ Nouvelle souscription: ${subscription.id}`);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    console.log(`🔄 Souscription mise à jour: ${subscription.id}`);
  }

  private async handleSubscriptionCanceled(subscription: Stripe.Subscription): Promise<void> {
    console.log(`❌ Souscription annulée: ${subscription.id}`);
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    console.log(`💰 Paiement réussi: ${invoice.amount_paid / 100}$ CAD`);
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    console.log(`❌ Échec paiement: ${invoice.customer}`);
  }

  private async handleTrialWillEnd(subscription: Stripe.Subscription): Promise<void> {
    console.log(`⏰ Trial se termine bientôt: ${subscription.id}`);
    // Logique pour préparer la conversion ou l'annulation
  }
}

export default new SalonStripeService();