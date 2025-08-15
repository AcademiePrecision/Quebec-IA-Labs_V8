// Supabase Edge Function for handling Stripe webhook events
// Endpoint: https://academieprecision.supabase.co/functions/v1/stripe-webhook

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface StripeEvent extends Stripe.Event {
  data: {
    object: any;
    previous_attributes?: any;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  try {
    // Initialize Stripe with secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      console.error('[Webhook] Missing required environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error',
          message: 'Missing required environment variables'
        }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('[Webhook] Missing stripe-signature header');
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Get the raw body
    const body = await req.text();

    // Verify the webhook signature
    let event: StripeEvent;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret) as StripeEvent;
      console.log(`[Webhook] Received event: ${event.type}`);
    } catch (err) {
      console.error(`[Webhook] Signature verification failed:`, err);
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'customer.created':
        await handleCustomerCreated(supabase, event.data.object);
        break;

      case 'customer.updated':
        await handleCustomerUpdated(supabase, event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(supabase, event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(supabase, event.data.object, event.data.previous_attributes);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, event.data.object);
        break;

      case 'payment_method.attached':
        await handlePaymentMethodAttached(supabase, event.data.object);
        break;

      case 'payment_method.detached':
        await handlePaymentMethodDetached(supabase, event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(supabase, event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(supabase, event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(supabase, event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(supabase, event.data.object);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true, event_type: event.type }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

// Customer Management Handlers
async function handleCustomerCreated(supabase: any, customer: Stripe.Customer) {
  console.log(`[Webhook] Customer created: ${customer.id}`);
  
  try {
    const { error } = await supabase
      .from('customers')
      .upsert({
        stripe_customer_id: customer.id,
        profile_id: customer.metadata?.profile_id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        created_at: new Date(customer.created * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('[Webhook] Error upserting customer:', error);
    } else {
      console.log(`[Webhook] Customer ${customer.id} upserted successfully`);
    }
  } catch (err) {
    console.error('[Webhook] Exception in handleCustomerCreated:', err);
  }
}

async function handleCustomerUpdated(supabase: any, customer: Stripe.Customer) {
  console.log(`[Webhook] Customer updated: ${customer.id}`);
  
  try {
    const { error } = await supabase
      .from('customers')
      .update({
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customer.id);

    if (error) {
      console.error('[Webhook] Error updating customer:', error);
    } else {
      console.log(`[Webhook] Customer ${customer.id} updated successfully`);
    }
  } catch (err) {
    console.error('[Webhook] Exception in handleCustomerUpdated:', err);
  }
}

// Subscription Management Handlers
async function handleSubscriptionCreated(supabase: any, subscription: Stripe.Subscription) {
  console.log(`[Webhook] Subscription created: ${subscription.id}`);
  
  try {
    // Get customer profile_id
    const { data: customer } = await supabase
      .from('customers')
      .select('profile_id')
      .eq('stripe_customer_id', subscription.customer)
      .single();

    if (!customer) {
      console.error(`[Webhook] Customer not found for subscription: ${subscription.id}`);
      return;
    }

    // Get subscription plan details
    const priceId = subscription.items.data[0]?.price?.id;
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('stripe_price_id', priceId)
      .single();

    if (!plan) {
      console.error(`[Webhook] Subscription plan not found for price: ${priceId}`);
      return;
    }

    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        stripe_subscription_id: subscription.id,
        profile_id: customer.profile_id,
        plan_id: plan.id,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
        trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        created_at: new Date(subscription.created * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('[Webhook] Error upserting subscription:', error);
    } else {
      console.log(`[Webhook] Subscription ${subscription.id} upserted successfully`);
    }
  } catch (err) {
    console.error('[Webhook] Exception in handleSubscriptionCreated:', err);
  }
}

async function handleSubscriptionUpdated(supabase: any, subscription: Stripe.Subscription, previous_attributes?: any) {
  console.log(`[Webhook] Subscription updated: ${subscription.id}`);
  
  try {
    const updateData: any = {
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    // Check if plan changed
    const newPriceId = subscription.items.data[0]?.price?.id;
    if (previous_attributes?.items) {
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('stripe_price_id', newPriceId)
        .single();

      if (plan) {
        updateData.plan_id = plan.id;
      }
    }

    const { error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('[Webhook] Error updating subscription:', error);
    } else {
      console.log(`[Webhook] Subscription ${subscription.id} updated successfully`);
    }
  } catch (err) {
    console.error('[Webhook] Exception in handleSubscriptionUpdated:', err);
  }
}

async function handleSubscriptionDeleted(supabase: any, subscription: Stripe.Subscription) {
  console.log(`[Webhook] Subscription deleted: ${subscription.id}`);
  
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('[Webhook] Error updating deleted subscription:', error);
    } else {
      console.log(`[Webhook] Subscription ${subscription.id} marked as canceled`);
    }
  } catch (err) {
    console.error('[Webhook] Exception in handleSubscriptionDeleted:', err);
  }
}

// Payment Method Handlers
async function handlePaymentMethodAttached(supabase: any, paymentMethod: Stripe.PaymentMethod) {
  console.log(`[Webhook] Payment method attached: ${paymentMethod.id}`);
  
  try {
    // Get customer profile_id
    const { data: customer } = await supabase
      .from('customers')
      .select('profile_id')
      .eq('stripe_customer_id', paymentMethod.customer)
      .single();

    if (!customer) {
      console.error(`[Webhook] Customer not found for payment method: ${paymentMethod.id}`);
      return;
    }

    const { error } = await supabase
      .from('payment_methods')
      .upsert({
        stripe_payment_method_id: paymentMethod.id,
        profile_id: customer.profile_id,
        type: paymentMethod.type,
        card_brand: paymentMethod.card?.brand,
        card_last4: paymentMethod.card?.last4,
        card_exp_month: paymentMethod.card?.exp_month,
        card_exp_year: paymentMethod.card?.exp_year,
        is_default: false, // Will be updated separately if needed
        created_at: new Date(paymentMethod.created * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('[Webhook] Error upserting payment method:', error);
    } else {
      console.log(`[Webhook] Payment method ${paymentMethod.id} upserted successfully`);
    }
  } catch (err) {
    console.error('[Webhook] Exception in handlePaymentMethodAttached:', err);
  }
}

async function handlePaymentMethodDetached(supabase: any, paymentMethod: Stripe.PaymentMethod) {
  console.log(`[Webhook] Payment method detached: ${paymentMethod.id}`);
  
  try {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('stripe_payment_method_id', paymentMethod.id);

    if (error) {
      console.error('[Webhook] Error deleting payment method:', error);
    } else {
      console.log(`[Webhook] Payment method ${paymentMethod.id} deleted successfully`);
    }
  } catch (err) {
    console.error('[Webhook] Exception in handlePaymentMethodDetached:', err);
  }
}

// Payment Transaction Handlers
async function handleInvoicePaymentSucceeded(supabase: any, invoice: Stripe.Invoice) {
  console.log(`[Webhook] Invoice payment succeeded: ${invoice.id}`);
  
  try {
    // Get customer profile_id
    const { data: customer } = await supabase
      .from('customers')
      .select('profile_id')
      .eq('stripe_customer_id', invoice.customer)
      .single();

    if (!customer) {
      console.error(`[Webhook] Customer not found for invoice: ${invoice.id}`);
      return;
    }

    // Calculate Quebec taxes
    const subtotal = invoice.subtotal / 100; // Convert from cents
    const gst = subtotal * 0.05; // 5% GST
    const qst = subtotal * 0.09975; // 9.975% QST
    const total = subtotal + gst + qst;

    const { error } = await supabase
      .from('transactions')
      .insert({
        stripe_payment_intent_id: invoice.payment_intent,
        stripe_invoice_id: invoice.id,
        profile_id: customer.profile_id,
        type: 'subscription',
        status: 'completed',
        amount_cad: total,
        subtotal_cad: subtotal,
        gst_cad: gst,
        qst_cad: qst,
        currency: 'CAD',
        description: `Subscription payment - Invoice ${invoice.number}`,
        created_at: new Date(invoice.created * 1000).toISOString(),
      });

    if (error) {
      console.error('[Webhook] Error creating transaction record:', error);
    } else {
      console.log(`[Webhook] Transaction recorded for invoice ${invoice.id}`);
    }

    // Update revenue analytics
    await updateRevenueAnalytics(supabase, total, 'subscription');

  } catch (err) {
    console.error('[Webhook] Exception in handleInvoicePaymentSucceeded:', err);
  }
}

async function handleInvoicePaymentFailed(supabase: any, invoice: Stripe.Invoice) {
  console.log(`[Webhook] Invoice payment failed: ${invoice.id}`);
  
  try {
    // Get customer profile_id
    const { data: customer } = await supabase
      .from('customers')
      .select('profile_id')
      .eq('stripe_customer_id', invoice.customer)
      .single();

    if (!customer) {
      console.error(`[Webhook] Customer not found for invoice: ${invoice.id}`);
      return;
    }

    const subtotal = invoice.subtotal / 100;
    const gst = subtotal * 0.05;
    const qst = subtotal * 0.09975;
    const total = subtotal + gst + qst;

    const { error } = await supabase
      .from('transactions')
      .insert({
        stripe_payment_intent_id: invoice.payment_intent,
        stripe_invoice_id: invoice.id,
        profile_id: customer.profile_id,
        type: 'subscription',
        status: 'failed',
        amount_cad: total,
        subtotal_cad: subtotal,
        gst_cad: gst,
        qst_cad: qst,
        currency: 'CAD',
        description: `Failed subscription payment - Invoice ${invoice.number}`,
        created_at: new Date(invoice.created * 1000).toISOString(),
      });

    if (error) {
      console.error('[Webhook] Error creating failed transaction record:', error);
    } else {
      console.log(`[Webhook] Failed transaction recorded for invoice ${invoice.id}`);
    }

  } catch (err) {
    console.error('[Webhook] Exception in handleInvoicePaymentFailed:', err);
  }
}

async function handlePaymentIntentSucceeded(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  console.log(`[Webhook] Payment intent succeeded: ${paymentIntent.id}`);
  
  try {
    // Skip if this is already handled by invoice webhook
    if (paymentIntent.invoice) {
      console.log(`[Webhook] Payment intent ${paymentIntent.id} handled by invoice webhook`);
      return;
    }

    // Get customer profile_id
    const { data: customer } = await supabase
      .from('customers')
      .select('profile_id')
      .eq('stripe_customer_id', paymentIntent.customer)
      .single();

    if (!customer) {
      console.error(`[Webhook] Customer not found for payment intent: ${paymentIntent.id}`);
      return;
    }

    const subtotal = paymentIntent.amount / 100; // Convert from cents
    const gst = subtotal * 0.05;
    const qst = subtotal * 0.09975;
    const total = subtotal + gst + qst;

    const { error } = await supabase
      .from('transactions')
      .insert({
        stripe_payment_intent_id: paymentIntent.id,
        profile_id: customer.profile_id,
        type: 'one_time',
        status: 'completed',
        amount_cad: total,
        subtotal_cad: subtotal,
        gst_cad: gst,
        qst_cad: qst,
        currency: 'CAD',
        description: paymentIntent.description || 'One-time payment',
        metadata: paymentIntent.metadata,
        created_at: new Date(paymentIntent.created * 1000).toISOString(),
      });

    if (error) {
      console.error('[Webhook] Error creating one-time transaction record:', error);
    } else {
      console.log(`[Webhook] One-time transaction recorded for payment intent ${paymentIntent.id}`);
    }

    // Update revenue analytics
    await updateRevenueAnalytics(supabase, total, 'one_time');

    // Handle royalty distribution if it's a formation/atelier purchase
    if (paymentIntent.metadata?.formation_id || paymentIntent.metadata?.atelier_id) {
      await handleRoyaltyDistribution(supabase, paymentIntent, total);
    }

  } catch (err) {
    console.error('[Webhook] Exception in handlePaymentIntentSucceeded:', err);
  }
}

async function handlePaymentIntentFailed(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  console.log(`[Webhook] Payment intent failed: ${paymentIntent.id}`);
  
  try {
    // Get customer profile_id
    const { data: customer } = await supabase
      .from('customers')
      .select('profile_id')
      .eq('stripe_customer_id', paymentIntent.customer)
      .single();

    if (!customer) {
      console.error(`[Webhook] Customer not found for payment intent: ${paymentIntent.id}`);
      return;
    }

    const subtotal = paymentIntent.amount / 100;
    const gst = subtotal * 0.05;
    const qst = subtotal * 0.09975;
    const total = subtotal + gst + qst;

    const { error } = await supabase
      .from('transactions')
      .insert({
        stripe_payment_intent_id: paymentIntent.id,
        profile_id: customer.profile_id,
        type: 'one_time',
        status: 'failed',
        amount_cad: total,
        subtotal_cad: subtotal,
        gst_cad: gst,
        qst_cad: qst,
        currency: 'CAD',
        description: paymentIntent.description || 'Failed one-time payment',
        metadata: paymentIntent.metadata,
        created_at: new Date(paymentIntent.created * 1000).toISOString(),
      });

    if (error) {
      console.error('[Webhook] Error creating failed one-time transaction record:', error);
    } else {
      console.log(`[Webhook] Failed one-time transaction recorded for payment intent ${paymentIntent.id}`);
    }

  } catch (err) {
    console.error('[Webhook] Exception in handlePaymentIntentFailed:', err);
  }
}

// Revenue Analytics Helper
async function updateRevenueAnalytics(supabase: any, amount: number, type: string) {
  try {
    const today = new Date();
    const yearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const { error } = await supabase
      .from('revenue_analytics')
      .upsert({
        month: yearMonth,
        subscription_revenue: type === 'subscription' ? amount : 0,
        one_time_revenue: type === 'one_time' ? amount : 0,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'month',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error('[Webhook] Error updating revenue analytics:', error);
    }
  } catch (err) {
    console.error('[Webhook] Exception in updateRevenueAnalytics:', err);
  }
}

// Royalty Distribution Helper
async function handleRoyaltyDistribution(supabase: any, paymentIntent: Stripe.PaymentIntent, totalAmount: number) {
  try {
    let formateurId: string | null = null;
    let salonId: string | null = null;
    let distributionType = 'formation'; // formation or atelier

    // Get formateur and salon info based on formation/atelier
    if (paymentIntent.metadata?.formation_id) {
      const { data: formation } = await supabase
        .from('formations')
        .select('formateur_id')
        .eq('id', paymentIntent.metadata.formation_id)
        .single();
      
      formateurId = formation?.formateur_id;
    } else if (paymentIntent.metadata?.atelier_id) {
      distributionType = 'atelier';
      
      const { data: atelier } = await supabase
        .from('ateliers')
        .select('formateur_id, salon_id')
        .eq('id', paymentIntent.metadata.atelier_id)
        .single();
      
      formateurId = atelier?.formateur_id;
      salonId = atelier?.salon_id;
    }

    if (!formateurId) {
      console.error('[Webhook] No formateur found for royalty distribution');
      return;
    }

    // Calculate royalty amounts
    let formateurAmount: number;
    let platformAmount: number;
    let salonAmount = 0;

    if (salonId) {
      // Atelier: 50% formateur, 40% platform, 10% salon
      formateurAmount = totalAmount * 0.5;
      platformAmount = totalAmount * 0.4;
      salonAmount = totalAmount * 0.1;
    } else {
      // Formation: 60% formateur, 40% platform
      formateurAmount = totalAmount * 0.6;
      platformAmount = totalAmount * 0.4;
    }

    // Create royalty distribution record
    const { error } = await supabase
      .from('royalty_distributions')
      .insert({
        transaction_id: paymentIntent.id,
        formateur_id: formateurId,
        salon_id: salonId,
        total_amount_cad: totalAmount,
        formateur_amount_cad: formateurAmount,
        platform_amount_cad: platformAmount,
        salon_amount_cad: salonAmount,
        distribution_type: distributionType,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('[Webhook] Error creating royalty distribution:', error);
    } else {
      console.log(`[Webhook] Royalty distribution created for ${distributionType}: ${paymentIntent.id}`);
    }

  } catch (err) {
    console.error('[Webhook] Exception in handleRoyaltyDistribution:', err);
  }
}