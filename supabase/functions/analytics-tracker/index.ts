// Analytics Event Tracker - Supabase Edge Function
// Tracks user behavior for revenue optimization

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyticsEvent {
  accountId?: string
  profileId?: string
  sessionId: string
  eventName: string
  eventCategory?: string
  eventProperties?: Record<string, any>
  platform: 'ios' | 'android' | 'web' | 'api'
  appVersion?: string
  deviceInfo?: Record<string, any>
}

interface RevenueMetrics {
  mrr: number
  dailyRevenue: number
  conversionRate: number
  churnRate: number
  avgCustomerValue: number
  ltv: number
  cac: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    const events: AnalyticsEvent[] = Array.isArray(body) ? body : [body]

    // Batch insert events
    const { data: insertedEvents, error } = await supabase
      .from('analytics_events')
      .insert(
        events.map(event => ({
          account_id: event.accountId,
          profile_id: event.profileId,
          session_id: event.sessionId,
          event_name: event.eventName,
          event_category: event.eventCategory,
          event_properties: event.eventProperties || {},
          platform: event.platform,
          app_version: event.appVersion,
          device_info: event.deviceInfo,
          created_at: new Date().toISOString(),
        }))
      )
      .select()

    if (error) throw error

    // Process critical events in real-time
    for (const event of events) {
      await processCriticalEvent(supabase, event)
    }

    // Update daily analytics if needed
    await updateDailyAnalytics(supabase)

    // Calculate real-time metrics
    const metrics = await calculateRealtimeMetrics(supabase)

    return new Response(
      JSON.stringify({
        success: true,
        eventsProcessed: insertedEvents?.length || 0,
        metrics,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Analytics tracker error:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function processCriticalEvent(supabase: any, event: AnalyticsEvent) {
  switch (event.eventName) {
    case 'subscription_started':
      await handleSubscriptionStart(supabase, event)
      break
    
    case 'subscription_canceled':
      await handleSubscriptionCancel(supabase, event)
      break
    
    case 'payment_completed':
      await handlePaymentCompleted(supabase, event)
      break
    
    case 'course_enrolled':
      await handleCourseEnrollment(supabase, event)
      break
    
    case 'course_completed':
      await handleCourseCompletion(supabase, event)
      break
    
    case 'appointment_booked':
      await handleAppointmentBooked(supabase, event)
      break
    
    case 'user_registered':
      await handleUserRegistration(supabase, event)
      break
  }
}

async function handleSubscriptionStart(supabase: any, event: AnalyticsEvent) {
  const { tier, amount } = event.eventProperties || {}
  
  // Update account subscription info
  await supabase
    .from('accounts')
    .update({
      subscription_tier: tier,
      subscription_status: 'active',
      subscription_started_at: new Date().toISOString(),
    })
    .eq('id', event.accountId)

  // Track conversion funnel
  await trackFunnelConversion(supabase, event.accountId, 'subscription', amount)
}

async function handleSubscriptionCancel(supabase: any, event: AnalyticsEvent) {
  const { reason } = event.eventProperties || {}
  
  // Update account
  await supabase
    .from('accounts')
    .update({
      subscription_status: 'canceled',
      subscription_ends_at: new Date().toISOString(),
    })
    .eq('id', event.accountId)

  // Track churn reason
  await supabase
    .from('analytics_events')
    .insert({
      account_id: event.accountId,
      event_name: 'churn_reason',
      event_properties: { reason },
      event_category: 'retention',
    })
}

async function handlePaymentCompleted(supabase: any, event: AnalyticsEvent) {
  const { amount, type, itemId } = event.eventProperties || {}
  
  // Update lifetime value
  const { data: account } = await supabase
    .from('accounts')
    .select('total_spent, lifetime_value')
    .eq('id', event.accountId)
    .single()

  if (account) {
    await supabase
      .from('accounts')
      .update({
        total_spent: (account.total_spent || 0) + amount,
        lifetime_value: (account.lifetime_value || 0) + amount,
        last_active_at: new Date().toISOString(),
      })
      .eq('id', event.accountId)
  }
}

async function handleCourseEnrollment(supabase: any, event: AnalyticsEvent) {
  const { courseId, price } = event.eventProperties || {}
  
  // Update formation enrollment count
  await supabase.rpc('increment', {
    table: 'formations',
    column: 'enrollment_count',
    row_id: courseId,
  })

  // Track revenue attribution
  await supabase
    .from('formations')
    .update({
      total_revenue: supabase.rpc('increment_by', { amount: price }),
    })
    .eq('id', courseId)
}

async function handleCourseCompletion(supabase: any, event: AnalyticsEvent) {
  const { courseId, profileId } = event.eventProperties || {}
  
  // Update completion metrics
  await supabase.rpc('increment', {
    table: 'formations',
    column: 'completion_count',
    row_id: courseId,
  })

  // Check for badge awards
  await checkAndAwardBadges(supabase, profileId, 'course_completion')
}

async function handleAppointmentBooked(supabase: any, event: AnalyticsEvent) {
  const { salonId, barbierId, source, amount } = event.eventProperties || {}
  
  // Update salon metrics
  if (salonId) {
    await supabase.rpc('increment', {
      table: 'salons',
      column: 'total_bookings',
      row_id: salonId,
    })

    await supabase
      .from('salons')
      .update({
        total_revenue: supabase.rpc('increment_by', { amount }),
      })
      .eq('id', salonId)
  }

  // Track booking source effectiveness
  await supabase
    .from('analytics_events')
    .insert({
      event_name: 'booking_source_conversion',
      event_properties: { source, amount },
      event_category: 'conversion',
    })
}

async function handleUserRegistration(supabase: any, event: AnalyticsEvent) {
  const { source, campaign, referralCode } = event.eventProperties || {}
  
  // Update acquisition tracking
  await supabase
    .from('accounts')
    .update({
      acquisition_channel: source,
      acquisition_campaign: campaign,
      referral_code: referralCode,
    })
    .eq('id', event.accountId)

  // Track cohort
  await supabase
    .from('analytics_events')
    .insert({
      account_id: event.accountId,
      event_name: 'cohort_joined',
      event_properties: {
        cohort: new Date().toISOString().slice(0, 7), // YYYY-MM
        source,
      },
      event_category: 'acquisition',
    })
}

async function trackFunnelConversion(
  supabase: any,
  accountId: string,
  funnelStep: string,
  value?: number
) {
  await supabase
    .from('analytics_events')
    .insert({
      account_id: accountId,
      event_name: 'funnel_conversion',
      event_properties: {
        step: funnelStep,
        value,
        timestamp: new Date().toISOString(),
      },
      event_category: 'conversion',
    })
}

async function checkAndAwardBadges(
  supabase: any,
  profileId: string,
  trigger: string
) {
  // Get badges with auto-award rules
  const { data: badges } = await supabase
    .from('badges')
    .select('*')
    .eq('auto_award_enabled', true)

  if (!badges) return

  for (const badge of badges) {
    const rules = badge.auto_award_rules || {}
    
    // Check if user meets criteria
    if (await meetsBadgeCriteria(supabase, profileId, rules, trigger)) {
      // Award badge if not already earned
      await supabase
        .from('user_badges')
        .upsert({
          profile_id: profileId,
          badge_id: badge.id,
          earned_at: new Date().toISOString(),
        }, {
          onConflict: 'profile_id,badge_id',
        })

      // Send notification
      await supabase
        .from('notifications')
        .insert({
          profile_id: profileId,
          title: 'Nouveau badge débloqué!',
          message: `Félicitations! Vous avez gagné le badge "${badge.name}"`,
          type: 'success',
        })
    }
  }
}

async function meetsBadgeCriteria(
  supabase: any,
  profileId: string,
  rules: any,
  trigger: string
): Promise<boolean> {
  // Implementation depends on specific badge rules
  // Example: Check course completions, spending, etc.
  
  if (rules.trigger !== trigger) return false
  
  if (rules.minCourseCompletions) {
    const { count } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact' })
      .eq('profile_id', profileId)
      .not('completed_at', 'is', null)
    
    if (count < rules.minCourseCompletions) return false
  }
  
  return true
}

async function updateDailyAnalytics(supabase: any) {
  const today = new Date().toISOString().slice(0, 10)
  
  // Calculate daily metrics
  const metrics = await calculateDailyMetrics(supabase, today)
  
  // Upsert into revenue_analytics
  await supabase
    .from('revenue_analytics')
    .upsert({
      date: today,
      ...metrics,
      created_at: new Date().toISOString(),
    }, {
      onConflict: 'date',
    })
}

async function calculateDailyMetrics(supabase: any, date: string) {
  // Get daily transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, type')
    .gte('created_at', `${date}T00:00:00`)
    .lt('created_at', `${date}T23:59:59`)
    .eq('status', 'succeeded')

  const dailyRevenue = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0
  const dailyTransactions = transactions?.length || 0

  // Get subscription breakdown
  const subscriptionRevenue = transactions
    ?.filter(t => t.type === 'subscription')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0
  
  const courseRevenue = transactions
    ?.filter(t => t.type === 'course_purchase')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0
  
  const appointmentRevenue = transactions
    ?.filter(t => t.type === 'appointment')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0

  // Get new customers
  const { count: newCustomers } = await supabase
    .from('accounts')
    .select('*', { count: 'exact' })
    .gte('created_at', `${date}T00:00:00`)
    .lt('created_at', `${date}T23:59:59`)

  // Get churned customers
  const { count: churnedCustomers } = await supabase
    .from('accounts')
    .select('*', { count: 'exact' })
    .eq('subscription_status', 'canceled')
    .gte('updated_at', `${date}T00:00:00`)
    .lt('updated_at', `${date}T23:59:59`)

  // Calculate MRR
  const { data: mrr } = await supabase.rpc('calculate_mrr')

  return {
    daily_revenue: dailyRevenue,
    daily_transactions: dailyTransactions,
    daily_new_customers: newCustomers || 0,
    daily_churned_customers: churnedCustomers || 0,
    mrr: mrr || 0,
    arr: (mrr || 0) * 12,
    subscription_revenue: subscriptionRevenue,
    course_revenue: courseRevenue,
    appointment_revenue: appointmentRevenue,
    average_transaction_value: dailyTransactions > 0 ? dailyRevenue / dailyTransactions : 0,
  }
}

async function calculateRealtimeMetrics(supabase: any): Promise<RevenueMetrics> {
  // Get MRR
  const { data: mrr } = await supabase.rpc('calculate_mrr')

  // Get daily revenue (last 24h)
  const { data: dailyTransactions } = await supabase
    .from('transactions')
    .select('amount')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .eq('status', 'succeeded')

  const dailyRevenue = dailyTransactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0

  // Calculate conversion rate (last 30 days)
  const { count: totalVisitors } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact' })
    .eq('event_name', 'page_view')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const { count: conversions } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact' })
    .eq('event_name', 'subscription_started')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const conversionRate = totalVisitors > 0 ? (conversions / totalVisitors) * 100 : 0

  // Calculate churn rate (monthly)
  const { count: activeCustomers } = await supabase
    .from('accounts')
    .select('*', { count: 'exact' })
    .eq('subscription_status', 'active')

  const { count: churnedThisMonth } = await supabase
    .from('accounts')
    .select('*', { count: 'exact' })
    .eq('subscription_status', 'canceled')
    .gte('updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const churnRate = activeCustomers > 0 ? (churnedThisMonth / activeCustomers) * 100 : 0

  // Calculate average customer value
  const { data: avgValue } = await supabase
    .from('accounts')
    .select('lifetime_value')
    .not('lifetime_value', 'is', null)

  const avgCustomerValue = avgValue?.length > 0
    ? avgValue.reduce((sum, a) => sum + Number(a.lifetime_value), 0) / avgValue.length
    : 0

  // Calculate LTV (simplified: avg value * avg retention months)
  const avgRetentionMonths = churnRate > 0 ? 100 / churnRate : 12
  const ltv = avgCustomerValue * avgRetentionMonths

  // Calculate CAC (from acquisition spend / new customers)
  // This would need integration with marketing spend data
  const cac = 30 // Placeholder - should be calculated from actual spend

  return {
    mrr: mrr || 0,
    dailyRevenue,
    conversionRate,
    churnRate,
    avgCustomerValue,
    ltv,
    cac,
  }
}