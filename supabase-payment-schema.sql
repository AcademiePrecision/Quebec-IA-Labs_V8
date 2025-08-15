-- =====================================================
-- ACADÉMIE PRÉCISION - SUPABASE PAYMENT SYSTEM SCHEMA
-- Complete SQL migration for payment infrastructure
-- Supports: Multi-tenant architecture, Quebec taxes, 
-- Subscription management, Royalty distribution
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE PAYMENT TABLES
-- =====================================================

-- Customers table - Links to user profiles with payment data
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id TEXT NOT NULL UNIQUE, -- Links to app's profile system
    user_type TEXT NOT NULL CHECK (user_type IN ('admin', 'salon_partenaire', 'maitre_formateur', 'academicien_barbier')),
    stripe_customer_id TEXT UNIQUE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    
    -- Billing address
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    province TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'CA',
    
    -- Quebec business info (for salon partners)
    business_number TEXT, -- Quebec business registration
    gst_number TEXT,      -- GST registration number
    qst_number TEXT,      -- QST registration number
    
    -- Metadata
    default_payment_method_id TEXT,
    preferred_language TEXT DEFAULT 'fr' CHECK (preferred_language IN ('fr', 'en')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment methods table - Tokenized payment method storage
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    stripe_payment_method_id TEXT NOT NULL UNIQUE,
    
    -- Payment method details
    type TEXT NOT NULL DEFAULT 'card',
    is_default BOOLEAN DEFAULT FALSE,
    
    -- Card details (stored from Stripe)
    card_brand TEXT,
    card_last4 TEXT,
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    card_funding TEXT, -- debit, credit, prepaid
    
    -- Billing details
    billing_name TEXT,
    billing_email TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_key TEXT NOT NULL UNIQUE, -- 'base', 'pro', 'elite'
    name_fr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    
    -- Pricing
    price_cents INTEGER NOT NULL, -- Price in cents CAD
    currency TEXT DEFAULT 'CAD',
    interval_type TEXT NOT NULL CHECK (interval_type IN ('month', 'year')),
    
    -- Stripe integration
    stripe_product_id TEXT UNIQUE,
    stripe_price_id TEXT UNIQUE,
    
    -- Plan limits
    max_formations INTEGER DEFAULT -1, -- -1 for unlimited
    max_ateliers INTEGER DEFAULT -1,   -- -1 for unlimited
    
    -- Features
    features_fr JSONB DEFAULT '[]'::jsonb,
    features_en JSONB DEFAULT '[]'::jsonb,
    
    -- Display
    is_popular BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    subscription_plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
    
    -- Stripe integration
    stripe_subscription_id TEXT UNIQUE,
    
    -- Status and lifecycle
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'canceled', 'past_due', 'unpaid', 'trialing', 'incomplete')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    
    -- Pricing snapshot (for historical accuracy)
    price_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'CAD',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TRANSACTION AND PAYMENT TABLES
-- =====================================================

-- Transactions table - Complete payment history
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id),
    
    -- Transaction details
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('subscription', 'formation', 'atelier', 'refund', 'royalty_payout')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded')),
    
    -- Amounts (in cents CAD)
    subtotal_cents INTEGER NOT NULL,
    gst_cents INTEGER DEFAULT 0,
    qst_cents INTEGER DEFAULT 0,
    total_cents INTEGER NOT NULL,
    
    -- Stripe integration
    stripe_payment_intent_id TEXT,
    stripe_charge_id TEXT,
    stripe_invoice_id TEXT,
    
    -- Description and metadata
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Formation/Atelier reference (if applicable)
    formation_id TEXT,
    atelier_id TEXT,
    
    -- Failure information
    failure_code TEXT,
    failure_message TEXT,
    
    -- Processing timestamps
    processed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment intents table - Track payment processing
CREATE TABLE IF NOT EXISTS public.payment_intents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    
    -- Stripe integration
    stripe_payment_intent_id TEXT NOT NULL UNIQUE,
    client_secret TEXT NOT NULL,
    
    -- Payment details
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'CAD',
    status TEXT NOT NULL,
    
    -- Purpose and metadata
    payment_type TEXT NOT NULL CHECK (payment_type IN ('subscription', 'formation', 'atelier')),
    reference_id TEXT, -- formation_id, atelier_id, etc.
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROYALTY AND REVENUE DISTRIBUTION
-- =====================================================

-- Royalty configurations table
CREATE TABLE IF NOT EXISTS public.royalty_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type TEXT NOT NULL CHECK (content_type IN ('formation', 'atelier')),
    
    -- Revenue split percentages (stored as integers, e.g., 60 = 60%)
    platform_percentage INTEGER NOT NULL DEFAULT 40,
    formateur_percentage INTEGER NOT NULL DEFAULT 60,
    salon_percentage INTEGER DEFAULT 0, -- For salon-specific content
    
    -- Minimum thresholds
    minimum_payout_cents INTEGER DEFAULT 5000, -- $50 minimum
    
    is_active BOOLEAN DEFAULT TRUE,
    effective_from TIMESTAMPTZ DEFAULT NOW(),
    effective_until TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure percentages add up to 100
    CONSTRAINT valid_percentages CHECK (
        platform_percentage + formateur_percentage + COALESCE(salon_percentage, 0) = 100
    )
);

-- Royalty distributions table - Track revenue sharing
CREATE TABLE IF NOT EXISTS public.royalty_distributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    royalty_config_id UUID NOT NULL REFERENCES public.royalty_configs(id),
    
    -- Content and parties
    content_id TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('formation', 'atelier')),
    formateur_profile_id TEXT NOT NULL,
    salon_profile_id TEXT, -- If applicable
    
    -- Revenue amounts (in cents CAD)
    gross_revenue_cents INTEGER NOT NULL,
    platform_share_cents INTEGER NOT NULL,
    formateur_share_cents INTEGER NOT NULL,
    salon_share_cents INTEGER DEFAULT 0,
    
    -- Tax deductions (from total revenue)
    gst_deducted_cents INTEGER DEFAULT 0,
    qst_deducted_cents INTEGER DEFAULT 0,
    
    -- Distribution period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Payout tracking
    payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processed', 'failed', 'on_hold')),
    payout_date TIMESTAMPTZ,
    payout_reference TEXT, -- Stripe transfer ID or similar
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS AND REVENUE TRACKING
-- =====================================================

-- Revenue analytics table - Pre-calculated metrics
CREATE TABLE IF NOT EXISTS public.revenue_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Period definition
    period_type TEXT NOT NULL CHECK (period_type IN ('day', 'week', 'month', 'quarter', 'year')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Revenue breakdown (in cents CAD)
    total_revenue_cents INTEGER DEFAULT 0,
    subscription_revenue_cents INTEGER DEFAULT 0,
    formation_revenue_cents INTEGER DEFAULT 0,
    atelier_revenue_cents INTEGER DEFAULT 0,
    
    -- Tax collected
    total_gst_cents INTEGER DEFAULT 0,
    total_qst_cents INTEGER DEFAULT 0,
    
    -- Platform metrics
    new_customers INTEGER DEFAULT 0,
    active_subscriptions INTEGER DEFAULT 0,
    churned_subscriptions INTEGER DEFAULT 0,
    
    -- Growth metrics
    revenue_growth_percentage DECIMAL(5,2) DEFAULT 0,
    customer_growth_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Calculated at
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint for period
    UNIQUE(period_type, period_start, period_end)
);

-- Customer lifetime value tracking
CREATE TABLE IF NOT EXISTS public.customer_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    
    -- Calculated metrics
    total_spent_cents INTEGER DEFAULT 0,
    avg_monthly_value_cents INTEGER DEFAULT 0,
    subscription_months INTEGER DEFAULT 0,
    formation_purchases INTEGER DEFAULT 0,
    atelier_bookings INTEGER DEFAULT 0,
    
    -- Engagement metrics
    last_transaction_at TIMESTAMPTZ,
    churn_risk_score DECIMAL(3,2) DEFAULT 0, -- 0-1 score
    
    -- Calculated periods
    calculation_date DATE NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One record per customer per calculation date
    UNIQUE(customer_id, calculation_date)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Customer indexes
CREATE INDEX IF NOT EXISTS idx_customers_profile_id ON public.customers(profile_id);
CREATE INDEX IF NOT EXISTS idx_customers_stripe_id ON public.customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_user_type ON public.customers(user_type);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- Payment method indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_customer ON public.payment_methods(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_id ON public.payment_methods(stripe_payment_method_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON public.payment_methods(customer_id, is_default) WHERE is_default = true;

-- Subscription indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON public.subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period ON public.subscriptions(current_period_start, current_period_end);

-- Transaction indexes
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON public.transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_payment ON public.transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_formation ON public.transactions(formation_id) WHERE formation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_atelier ON public.transactions(atelier_id) WHERE atelier_id IS NOT NULL;

-- Royalty indexes
CREATE INDEX IF NOT EXISTS idx_royalty_distributions_transaction ON public.royalty_distributions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_royalty_distributions_formateur ON public.royalty_distributions(formateur_profile_id);
CREATE INDEX IF NOT EXISTS idx_royalty_distributions_content ON public.royalty_distributions(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_royalty_distributions_period ON public.royalty_distributions(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_royalty_distributions_payout_status ON public.royalty_distributions(payout_status);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_revenue_analytics_period ON public.revenue_analytics(period_type, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_customer_analytics_customer ON public.customer_analytics(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_analytics_date ON public.customer_analytics(calculation_date);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.royalty_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.royalty_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_analytics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ADMIN FULL ACCESS POLICIES
-- =====================================================

-- Admins can access all data (based on app-level admin verification)
CREATE POLICY "Admins can access all customers" ON public.customers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.customers c 
            WHERE c.profile_id = auth.jwt() ->> 'profile_id' 
            AND c.user_type = 'admin'
        )
    );

CREATE POLICY "Admins can access all payment methods" ON public.payment_methods
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.customers c 
            WHERE c.profile_id = auth.jwt() ->> 'profile_id' 
            AND c.user_type = 'admin'
        )
    );

CREATE POLICY "Admins can access all subscriptions" ON public.subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.customers c 
            WHERE c.profile_id = auth.jwt() ->> 'profile_id' 
            AND c.user_type = 'admin'
        )
    );

CREATE POLICY "Admins can access all transactions" ON public.transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.customers c 
            WHERE c.profile_id = auth.jwt() ->> 'profile_id' 
            AND c.user_type = 'admin'
        )
    );

CREATE POLICY "Admins can access all payment intents" ON public.payment_intents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.customers c 
            WHERE c.profile_id = auth.jwt() ->> 'profile_id' 
            AND c.user_type = 'admin'
        )
    );

CREATE POLICY "Admins can access all royalty distributions" ON public.royalty_distributions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.customers c 
            WHERE c.profile_id = auth.jwt() ->> 'profile_id' 
            AND c.user_type = 'admin'
        )
    );

CREATE POLICY "Admins can access all analytics" ON public.revenue_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.customers c 
            WHERE c.profile_id = auth.jwt() ->> 'profile_id' 
            AND c.user_type = 'admin'
        )
    );

CREATE POLICY "Admins can access all customer analytics" ON public.customer_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.customers c 
            WHERE c.profile_id = auth.jwt() ->> 'profile_id' 
            AND c.user_type = 'admin'
        )
    );

-- =====================================================
-- USER-SPECIFIC ACCESS POLICIES
-- =====================================================

-- Users can only access their own customer data
CREATE POLICY "Users can access own customer data" ON public.customers
    FOR ALL USING (profile_id = auth.jwt() ->> 'profile_id');

-- Users can only access their own payment methods
CREATE POLICY "Users can access own payment methods" ON public.payment_methods
    FOR ALL USING (
        customer_id IN (
            SELECT id FROM public.customers 
            WHERE profile_id = auth.jwt() ->> 'profile_id'
        )
    );

-- Users can only access their own subscriptions
CREATE POLICY "Users can access own subscriptions" ON public.subscriptions
    FOR ALL USING (
        customer_id IN (
            SELECT id FROM public.customers 
            WHERE profile_id = auth.jwt() ->> 'profile_id'
        )
    );

-- Users can only access their own transactions
CREATE POLICY "Users can access own transactions" ON public.transactions
    FOR ALL USING (
        customer_id IN (
            SELECT id FROM public.customers 
            WHERE profile_id = auth.jwt() ->> 'profile_id'
        )
    );

-- Users can only access their own payment intents
CREATE POLICY "Users can access own payment intents" ON public.payment_intents
    FOR ALL USING (
        customer_id IN (
            SELECT id FROM public.customers 
            WHERE profile_id = auth.jwt() ->> 'profile_id'
        )
    );

-- =====================================================
-- FORMATEUR-SPECIFIC POLICIES
-- =====================================================

-- Formateurs can see their own royalty distributions
CREATE POLICY "Formateurs can access own royalties" ON public.royalty_distributions
    FOR SELECT USING (
        formateur_profile_id = auth.jwt() ->> 'profile_id'
        OR (
            EXISTS (
                SELECT 1 FROM public.customers c 
                WHERE c.profile_id = auth.jwt() ->> 'profile_id' 
                AND c.user_type = 'admin'
            )
        )
    );

-- =====================================================
-- PUBLIC READ POLICIES
-- =====================================================

-- Subscription plans are publicly readable (for pricing display)
CREATE POLICY "Subscription plans are publicly readable" ON public.subscription_plans
    FOR SELECT USING (is_active = true);

-- Royalty configs are publicly readable (for transparency)
CREATE POLICY "Royalty configs are publicly readable" ON public.royalty_configs
    FOR SELECT USING (is_active = true);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON public.payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_intents_updated_at BEFORE UPDATE ON public.payment_intents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_royalty_configs_updated_at BEFORE UPDATE ON public.royalty_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_royalty_distributions_updated_at BEFORE UPDATE ON public.royalty_distributions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_revenue_analytics_updated_at BEFORE UPDATE ON public.revenue_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_analytics_updated_at BEFORE UPDATE ON public.customer_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one default payment method per customer
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        -- Unset all other default payment methods for this customer
        UPDATE public.payment_methods 
        SET is_default = false 
        WHERE customer_id = NEW.customer_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER ensure_single_default_payment_method_trigger 
    BEFORE INSERT OR UPDATE ON public.payment_methods 
    FOR EACH ROW EXECUTE FUNCTION ensure_single_default_payment_method();

-- Function to calculate Quebec taxes
CREATE OR REPLACE FUNCTION calculate_quebec_taxes(subtotal_cents INTEGER)
RETURNS TABLE(gst_cents INTEGER, qst_cents INTEGER, total_cents INTEGER) AS $$
DECLARE
    gst_rate DECIMAL := 0.05;    -- 5% GST
    qst_rate DECIMAL := 0.09975; -- 9.975% QST
    calculated_gst INTEGER;
    calculated_qst INTEGER;
    calculated_total INTEGER;
BEGIN
    calculated_gst := ROUND(subtotal_cents * gst_rate);
    calculated_qst := ROUND(subtotal_cents * qst_rate);
    calculated_total := subtotal_cents + calculated_gst + calculated_qst;
    
    RETURN QUERY SELECT calculated_gst, calculated_qst, calculated_total;
END;
$$ language 'plpgsql';

-- =====================================================
-- INITIAL DATA SEEDING
-- =====================================================

-- Insert default subscription plans
INSERT INTO public.subscription_plans (plan_key, name_fr, name_en, price_cents, features_fr, features_en, max_formations, max_ateliers, display_order, is_popular) VALUES
('base', 'Formation de Base', 'Basic Training', 2900, 
 '["Accès à 5 formations par mois", "Support par email", "Certificats de base", "Accès mobile"]'::jsonb,
 '["Access to 5 courses per month", "Email support", "Basic certificates", "Mobile access"]'::jsonb,
 5, 2, 3, false),

('pro', 'Formation Professionnelle', 'Professional Training', 7900,
 '["Accès illimité aux formations", "Support prioritaire", "Certificats professionnels", "Accès aux ateliers pratiques", "Suivi personnalisé"]'::jsonb,
 '["Unlimited course access", "Priority support", "Professional certificates", "Practical workshop access", "Personal tracking"]'::jsonb,
 -1, 10, 2, true),

('elite', 'Formation Elite', 'Elite Training', 19900,
 '["Accès illimité à tout le contenu", "Support dédié 24/7", "Certificats avancés", "Ateliers illimités", "Mentorat personnalisé", "Accès aux formations exclusives", "Réseau professionnel"]'::jsonb,
 '["Unlimited access to all content", "Dedicated 24/7 support", "Advanced certificates", "Unlimited workshops", "Personal mentoring", "Exclusive training access", "Professional network"]'::jsonb,
 -1, -1, 1, false)

ON CONFLICT (plan_key) DO UPDATE SET
    name_fr = EXCLUDED.name_fr,
    name_en = EXCLUDED.name_en,
    price_cents = EXCLUDED.price_cents,
    features_fr = EXCLUDED.features_fr,
    features_en = EXCLUDED.features_en,
    max_formations = EXCLUDED.max_formations,
    max_ateliers = EXCLUDED.max_ateliers,
    display_order = EXCLUDED.display_order,
    is_popular = EXCLUDED.is_popular,
    updated_at = NOW();

-- Insert default royalty configuration (60/40 split)
INSERT INTO public.royalty_configs (content_type, platform_percentage, formateur_percentage, salon_percentage, minimum_payout_cents) VALUES
('formation', 40, 60, 0, 5000),
('atelier', 40, 50, 10, 5000) -- Salons get 10% for providing space

ON CONFLICT DO NOTHING;

-- =====================================================
-- HELPFUL VIEWS FOR ANALYTICS
-- =====================================================

-- View for monthly revenue summary
CREATE OR REPLACE VIEW monthly_revenue_summary AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as transaction_count,
    SUM(total_cents) as total_revenue_cents,
    SUM(CASE WHEN transaction_type = 'subscription' THEN total_cents ELSE 0 END) as subscription_revenue_cents,
    SUM(CASE WHEN transaction_type = 'formation' THEN total_cents ELSE 0 END) as formation_revenue_cents,
    SUM(CASE WHEN transaction_type = 'atelier' THEN total_cents ELSE 0 END) as atelier_revenue_cents,
    SUM(gst_cents) as total_gst_cents,
    SUM(qst_cents) as total_qst_cents
FROM public.transactions 
WHERE status = 'succeeded'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- View for customer subscription status
CREATE OR REPLACE VIEW customer_subscription_status AS
SELECT 
    c.id as customer_id,
    c.profile_id,
    c.user_type,
    c.full_name,
    c.email,
    s.id as subscription_id,
    sp.plan_key,
    sp.name_fr as plan_name,
    s.status as subscription_status,
    s.current_period_start,
    s.current_period_end,
    s.price_cents as monthly_price_cents
FROM public.customers c
LEFT JOIN public.subscriptions s ON c.id = s.customer_id AND s.status IN ('active', 'trialing')
LEFT JOIN public.subscription_plans sp ON s.subscription_plan_id = sp.id;

-- View for formateur royalty summary
CREATE OR REPLACE VIEW formateur_royalty_summary AS
SELECT 
    rd.formateur_profile_id,
    COUNT(*) as total_distributions,
    SUM(rd.gross_revenue_cents) as total_gross_revenue_cents,
    SUM(rd.formateur_share_cents) as total_formateur_earnings_cents,
    SUM(CASE WHEN rd.payout_status = 'processed' THEN rd.formateur_share_cents ELSE 0 END) as paid_earnings_cents,
    SUM(CASE WHEN rd.payout_status = 'pending' THEN rd.formateur_share_cents ELSE 0 END) as pending_earnings_cents
FROM public.royalty_distributions rd
GROUP BY rd.formateur_profile_id;

-- =====================================================
-- SCHEMA MIGRATION COMPLETE
-- =====================================================

-- Log successful migration
DO $$
BEGIN
    RAISE NOTICE 'Académie Précision payment schema migration completed successfully!';
    RAISE NOTICE 'Tables created: customers, payment_methods, subscription_plans, subscriptions, transactions, payment_intents, royalty_configs, royalty_distributions, revenue_analytics, customer_analytics';
    RAISE NOTICE 'RLS policies applied for multi-tenant security';
    RAISE NOTICE 'Indexes created for optimal performance';
    RAISE NOTICE 'Quebec tax calculation functions ready';
    RAISE NOTICE 'Initial subscription plans and royalty configs seeded';
END $$;