-- =====================================================
-- ACADÉMIE PRÉCISION - ARCHITECTURE DATA SUPABASE
-- =====================================================
-- Version: 1.0.0
-- Objectif MRR: $101,666/mois
-- Focus: Performance, Analytics, Real-time & Marcel AI Integration
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search optimization
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For composite indexes
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For encryption

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Accounts (Single account can have multiple profiles)
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    preferred_language TEXT DEFAULT 'fr' CHECK (preferred_language IN ('fr', 'en')),
    profile_photo_url TEXT,
    
    -- Subscription & Revenue tracking
    stripe_customer_id TEXT UNIQUE,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro', 'enterprise')),
    subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'past_due', 'canceled', 'trialing')),
    subscription_started_at TIMESTAMPTZ,
    subscription_ends_at TIMESTAMPTZ,
    
    -- Analytics & Engagement
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    total_spent DECIMAL(10,2) DEFAULT 0,
    lifetime_value DECIMAL(10,2) DEFAULT 0,
    acquisition_channel TEXT,
    acquisition_campaign TEXT,
    referral_code TEXT,
    referred_by UUID REFERENCES accounts(id),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Search optimization
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('french', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(email, ''))
    ) STORED
);

-- Profiles (Multiple types per account)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    user_type TEXT NOT NULL CHECK (user_type IN ('admin', 'salon_partenaire', 'maitre_formateur', 'academicien_barbier')),
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false,
    
    -- Admin specific
    admin_access_code TEXT,
    department TEXT,
    
    -- Salon specific
    salon_name TEXT,
    salon_address TEXT,
    business_number TEXT,
    website TEXT,
    employee_count INTEGER,
    
    -- Formateur specific
    specialties TEXT[],
    years_experience INTEGER,
    certifications TEXT[],
    portfolio TEXT[],
    attached_salon_id UUID,
    hourly_rate DECIMAL(10,2),
    weekly_availability JSONB,
    professional_bio TEXT,
    
    -- Academicien specific
    experience_level TEXT CHECK (experience_level IN ('debutant', 'intermediaire', 'avance')),
    specialties_of_interest TEXT[],
    training_goals TEXT,
    employer_salon_id UUID,
    monthly_training_budget DECIMAL(10,2),
    
    -- Performance metrics
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    engagement_score DECIMAL(5,2) DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(account_id, user_type)
);

-- Salons (Business entities)
CREATE TABLE salons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    business_hours JSONB,
    services_offered TEXT[],
    equipment_available TEXT[],
    
    -- Revenue sharing
    revenue_share_percentage DECIMAL(5,2) DEFAULT 60.00,
    stripe_account_id TEXT,
    payout_enabled BOOLEAN DEFAULT false,
    
    -- Analytics
    total_bookings INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    
    -- Location (for future geo features)
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MARCEL AI INTEGRATION TABLES
-- =====================================================

-- Marcel Conversations
CREATE TABLE marcel_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id),
    phone_number TEXT NOT NULL,
    session_id TEXT UNIQUE,
    
    -- Client recognition
    is_recognized_client BOOLEAN DEFAULT false,
    client_name TEXT,
    preferred_language TEXT DEFAULT 'fr',
    
    -- Conversation state
    current_intent TEXT,
    conversation_state JSONB DEFAULT '{}',
    context_data JSONB DEFAULT '{}',
    
    -- Analytics
    message_count INTEGER DEFAULT 0,
    conversion_achieved BOOLEAN DEFAULT false,
    booking_created_id UUID,
    
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- Marcel Messages
CREATE TABLE marcel_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES marcel_conversations(id) ON DELETE CASCADE,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'media')),
    content TEXT NOT NULL,
    intent_detected TEXT,
    confidence_score DECIMAL(3,2),
    
    -- Twilio specific
    twilio_message_sid TEXT,
    twilio_status TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments (Bookings)
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES accounts(id),
    salon_id UUID NOT NULL REFERENCES salons(id),
    barbier_id UUID REFERENCES profiles(id),
    
    -- Booking details
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    services TEXT[] NOT NULL,
    
    -- Pricing
    total_price DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Status tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'canceled', 'no_show')),
    confirmed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    
    -- Source tracking
    booking_source TEXT CHECK (booking_source IN ('app', 'web', 'marcel_ai', 'phone', 'walk_in')),
    marcel_conversation_id UUID REFERENCES marcel_conversations(id),
    
    -- Notes
    client_notes TEXT,
    barbier_notes TEXT,
    
    -- Notifications
    reminder_sent BOOLEAN DEFAULT false,
    reminder_sent_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- LEARNING & CONTENT TABLES
-- =====================================================

-- Formations (Courses)
CREATE TABLE formations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    level TEXT CHECK (level IN ('debutant', 'intermediaire', 'avance')),
    
    -- Pricing & Revenue
    price DECIMAL(10,2) NOT NULL,
    promotional_price DECIMAL(10,2),
    revenue_share_percentage DECIMAL(5,2) DEFAULT 60.00,
    
    -- Content details
    duration_hours INTEGER,
    formateur_id UUID NOT NULL REFERENCES profiles(id),
    preview_video_url TEXT,
    thumbnail_url TEXT,
    
    -- Status & Approval
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'under_review', 'approved', 'published', 'rejected', 'archived')),
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    reviewer_id UUID REFERENCES profiles(id),
    review_comments TEXT,
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    enrollment_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    
    -- SEO & Search
    tags TEXT[],
    search_vector tsvector,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules (Course sections)
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    formation_id UUID NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL,
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    average_watch_time INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(formation_id, order_index)
);

-- Enrollments
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id),
    formation_id UUID NOT NULL REFERENCES formations(id),
    
    -- Progress tracking
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    completed_modules UUID[] DEFAULT ARRAY[]::UUID[],
    last_accessed_module_id UUID REFERENCES modules(id),
    last_accessed_at TIMESTAMPTZ,
    
    -- Completion
    completed_at TIMESTAMPTZ,
    certificate_issued BOOLEAN DEFAULT false,
    certificate_url TEXT,
    
    -- Payment
    payment_amount DECIMAL(10,2),
    payment_status TEXT DEFAULT 'pending',
    stripe_payment_intent_id TEXT,
    
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(profile_id, formation_id)
);

-- =====================================================
-- PAYMENT & REVENUE TABLES
-- =====================================================

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id),
    
    -- Transaction details
    type TEXT NOT NULL CHECK (type IN ('subscription', 'course_purchase', 'appointment', 'workshop', 'refund', 'payout')),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'CAD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')),
    
    -- Related entities
    formation_id UUID REFERENCES formations(id),
    appointment_id UUID REFERENCES appointments(id),
    workshop_id UUID,
    
    -- Stripe
    stripe_payment_intent_id TEXT,
    stripe_charge_id TEXT,
    stripe_refund_id TEXT,
    payment_method TEXT,
    
    -- Revenue sharing
    revenue_share_amount DECIMAL(10,2),
    revenue_share_recipient_id UUID REFERENCES profiles(id),
    
    -- Metadata
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Revenue Analytics (Materialized for performance)
CREATE TABLE revenue_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    
    -- Daily metrics
    daily_revenue DECIMAL(10,2) DEFAULT 0,
    daily_transactions INTEGER DEFAULT 0,
    daily_new_customers INTEGER DEFAULT 0,
    daily_churned_customers INTEGER DEFAULT 0,
    
    -- Cumulative metrics
    mrr DECIMAL(10,2) DEFAULT 0,
    arr DECIMAL(10,2) DEFAULT 0,
    total_customers INTEGER DEFAULT 0,
    paying_customers INTEGER DEFAULT 0,
    
    -- By type
    subscription_revenue DECIMAL(10,2) DEFAULT 0,
    course_revenue DECIMAL(10,2) DEFAULT 0,
    appointment_revenue DECIMAL(10,2) DEFAULT 0,
    
    -- Averages
    average_transaction_value DECIMAL(10,2) DEFAULT 0,
    average_customer_value DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(date)
);

-- =====================================================
-- ENGAGEMENT & GAMIFICATION TABLES
-- =====================================================

-- Badges
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    criteria TEXT,
    rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    points_value INTEGER DEFAULT 0,
    
    -- Auto-award rules
    auto_award_enabled BOOLEAN DEFAULT false,
    auto_award_rules JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Badges
CREATE TABLE user_badges (
    profile_id UUID NOT NULL REFERENCES profiles(id),
    badge_id UUID NOT NULL REFERENCES badges(id),
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (profile_id, badge_id)
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id),
    
    -- Content
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'promotion')),
    
    -- Action
    action_type TEXT,
    action_data JSONB,
    
    -- Status
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    
    -- Delivery
    push_sent BOOLEAN DEFAULT false,
    email_sent BOOLEAN DEFAULT false,
    sms_sent BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- =====================================================
-- ANALYTICS EVENT TRACKING
-- =====================================================

CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id),
    profile_id UUID REFERENCES profiles(id),
    session_id TEXT,
    
    -- Event details
    event_name TEXT NOT NULL,
    event_category TEXT,
    event_properties JSONB DEFAULT '{}',
    
    -- Context
    platform TEXT CHECK (platform IN ('ios', 'android', 'web', 'api')),
    app_version TEXT,
    device_info JSONB,
    
    -- Location
    ip_address INET,
    country_code TEXT,
    region TEXT,
    
    -- Performance
    duration_ms INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Accounts indexes
CREATE INDEX idx_accounts_email ON accounts(email);
CREATE INDEX idx_accounts_phone ON accounts(phone);
CREATE INDEX idx_accounts_stripe_customer ON accounts(stripe_customer_id);
CREATE INDEX idx_accounts_subscription ON accounts(subscription_tier, subscription_status);
CREATE INDEX idx_accounts_search ON accounts USING GIN(search_vector);
CREATE INDEX idx_accounts_created ON accounts(created_at DESC);

-- Profiles indexes
CREATE INDEX idx_profiles_account ON profiles(account_id);
CREATE INDEX idx_profiles_type ON profiles(user_type);
CREATE INDEX idx_profiles_active ON profiles(is_active) WHERE is_active = true;
CREATE INDEX idx_profiles_salon ON profiles(attached_salon_id) WHERE attached_salon_id IS NOT NULL;

-- Marcel indexes
CREATE INDEX idx_marcel_conv_phone ON marcel_conversations(phone_number);
CREATE INDEX idx_marcel_conv_session ON marcel_conversations(session_id);
CREATE INDEX idx_marcel_conv_account ON marcel_conversations(account_id);
CREATE INDEX idx_marcel_msg_conv ON marcel_messages(conversation_id);
CREATE INDEX idx_marcel_msg_created ON marcel_messages(created_at DESC);

-- Appointments indexes
CREATE INDEX idx_appointments_date ON appointments(date, start_time);
CREATE INDEX idx_appointments_salon ON appointments(salon_id);
CREATE INDEX idx_appointments_barbier ON appointments(barbier_id);
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_source ON appointments(booking_source);

-- Formations indexes
CREATE INDEX idx_formations_status ON formations(status);
CREATE INDEX idx_formations_category ON formations(category);
CREATE INDEX idx_formations_formateur ON formations(formateur_id);
CREATE INDEX idx_formations_published ON formations(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_formations_search ON formations USING GIN(search_vector);

-- Enrollments indexes
CREATE INDEX idx_enrollments_profile ON enrollments(profile_id);
CREATE INDEX idx_enrollments_formation ON enrollments(formation_id);
CREATE INDEX idx_enrollments_progress ON enrollments(progress_percentage);

-- Transactions indexes
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_date ON transactions(created_at DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_stripe ON transactions(stripe_payment_intent_id);

-- Analytics indexes
CREATE INDEX idx_analytics_events_account ON analytics_events(account_id);
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);

-- Revenue analytics indexes
CREATE UNIQUE INDEX idx_revenue_analytics_date ON revenue_analytics(date DESC);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all relevant tables
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON salons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_formations_updated_at BEFORE UPDATE ON formations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Calculate MRR function
CREATE OR REPLACE FUNCTION calculate_mrr()
RETURNS DECIMAL AS $$
DECLARE
    total_mrr DECIMAL;
BEGIN
    SELECT COALESCE(SUM(
        CASE subscription_tier
            WHEN 'basic' THEN 29
            WHEN 'pro' THEN 79
            WHEN 'enterprise' THEN 199
            ELSE 0
        END
    ), 0) INTO total_mrr
    FROM accounts
    WHERE subscription_status = 'active';
    
    RETURN total_mrr;
END;
$$ LANGUAGE plpgsql;

-- Update formation search vector
CREATE OR REPLACE FUNCTION update_formation_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('french',
        coalesce(NEW.title, '') || ' ' ||
        coalesce(NEW.description, '') || ' ' ||
        coalesce(NEW.category, '') || ' ' ||
        coalesce(array_to_string(NEW.tags, ' '), '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_formation_search
    BEFORE INSERT OR UPDATE ON formations
    FOR EACH ROW EXECUTE FUNCTION update_formation_search_vector();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Accounts policies
CREATE POLICY "Users can view own account" ON accounts
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own account" ON accounts
    FOR UPDATE USING (auth.uid() = id);

-- Profiles policies
CREATE POLICY "Users can view own profiles" ON profiles
    FOR SELECT USING (account_id = auth.uid());

CREATE POLICY "Users can create own profiles" ON profiles
    FOR INSERT WITH CHECK (account_id = auth.uid());

CREATE POLICY "Users can update own profiles" ON profiles
    FOR UPDATE USING (account_id = auth.uid());

-- Formations policies
CREATE POLICY "Anyone can view published formations" ON formations
    FOR SELECT USING (status = 'published');

CREATE POLICY "Formateurs can manage own formations" ON formations
    FOR ALL USING (formateur_id IN (
        SELECT id FROM profiles WHERE account_id = auth.uid()
    ));

-- Appointments policies
CREATE POLICY "Users can view own appointments" ON appointments
    FOR SELECT USING (
        client_id = auth.uid() OR
        barbier_id IN (SELECT id FROM profiles WHERE account_id = auth.uid())
    );

-- =====================================================
-- INITIAL DATA & VIEWS
-- =====================================================

-- Create real-time revenue view
CREATE OR REPLACE VIEW v_real_time_revenue AS
SELECT
    calculate_mrr() as current_mrr,
    calculate_mrr() * 12 as current_arr,
    COUNT(DISTINCT a.id) FILTER (WHERE a.subscription_status = 'active') as active_subscribers,
    COUNT(DISTINCT a.id) as total_users,
    AVG(a.lifetime_value) as avg_ltv,
    COUNT(DISTINCT t.id) FILTER (WHERE t.created_at >= NOW() - INTERVAL '24 hours') as daily_transactions,
    SUM(t.amount) FILTER (WHERE t.created_at >= NOW() - INTERVAL '24 hours') as daily_revenue
FROM accounts a
LEFT JOIN transactions t ON t.account_id = a.id AND t.status = 'succeeded';

-- Create appointment availability view
CREATE OR REPLACE VIEW v_appointment_availability AS
SELECT
    s.id as salon_id,
    s.name as salon_name,
    p.id as barbier_id,
    p.first_name || ' ' || p.last_name as barbier_name,
    a.date,
    a.start_time,
    a.end_time,
    a.status
FROM salons s
CROSS JOIN profiles p
LEFT JOIN appointments a ON a.salon_id = s.id AND a.barbier_id = p.id
WHERE p.user_type = 'maitre_formateur'
  AND p.attached_salon_id = s.id
  AND p.is_active = true;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE accounts IS 'Core user accounts with subscription and revenue tracking';
COMMENT ON TABLE profiles IS 'Multiple profile types per account (admin, salon, formateur, academicien)';
COMMENT ON TABLE marcel_conversations IS 'AI assistant conversation tracking for appointment automation';
COMMENT ON TABLE appointments IS 'Booking system with Marcel AI integration';
COMMENT ON TABLE formations IS 'Course content with approval workflow and revenue sharing';
COMMENT ON TABLE transactions IS 'All financial transactions with Stripe integration';
COMMENT ON TABLE revenue_analytics IS 'Pre-calculated daily revenue metrics for dashboard performance';
COMMENT ON TABLE analytics_events IS 'User behavior tracking for conversion optimization';

COMMENT ON FUNCTION calculate_mrr() IS 'Real-time MRR calculation based on active subscriptions';
COMMENT ON VIEW v_real_time_revenue IS 'Live revenue metrics for analytics dashboard';