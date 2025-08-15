-- =====================================================
-- REAL-TIME SUBSCRIPTIONS & ROW LEVEL SECURITY
-- =====================================================
-- Configure real-time channels and security policies
-- =====================================================

-- =====================================================
-- REAL-TIME CHANNELS CONFIGURATION
-- =====================================================

-- Enable real-time for critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE marcel_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE marcel_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE revenue_analytics;

-- =====================================================
-- HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Check if user owns a profile
CREATE OR REPLACE FUNCTION auth.user_owns_profile(profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = profile_id
        AND account_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION auth.user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE account_id = auth.uid()
        AND user_type = 'admin'
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is salon owner
CREATE OR REPLACE FUNCTION auth.user_is_salon_owner()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE account_id = auth.uid()
        AND user_type = 'salon_partenaire'
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is formateur
CREATE OR REPLACE FUNCTION auth.user_is_formateur()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE account_id = auth.uid()
        AND user_type = 'maitre_formateur'
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's salon id
CREATE OR REPLACE FUNCTION auth.user_salon_id()
RETURNS UUID AS $$
DECLARE
    salon_id UUID;
BEGIN
    SELECT s.id INTO salon_id
    FROM salons s
    JOIN profiles p ON p.id = s.profile_id
    WHERE p.account_id = auth.uid()
    LIMIT 1;
    
    RETURN salon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ENHANCED RLS POLICIES
-- =====================================================

-- Accounts policies (refined)
DROP POLICY IF EXISTS "Users can view own account" ON accounts;
CREATE POLICY "accounts_select_own" ON accounts
    FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own account" ON accounts;
CREATE POLICY "accounts_update_own" ON accounts
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Profiles policies (refined)
DROP POLICY IF EXISTS "Users can view own profiles" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (
        account_id = auth.uid() OR
        auth.user_is_admin()
    );

DROP POLICY IF EXISTS "Users can create own profiles" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT WITH CHECK (
        account_id = auth.uid() AND
        (
            -- Admins can create any profile type
            auth.user_is_admin() OR
            -- Non-admins can't create admin profiles
            user_type != 'admin'
        )
    );

DROP POLICY IF EXISTS "Users can update own profiles" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (account_id = auth.uid())
    WITH CHECK (account_id = auth.uid());

-- Salons policies
CREATE POLICY "salons_select_all" ON salons
    FOR SELECT USING (true); -- Public can view salons

CREATE POLICY "salons_insert_owner" ON salons
    FOR INSERT WITH CHECK (
        auth.user_is_salon_owner() AND
        profile_id IN (
            SELECT id FROM profiles WHERE account_id = auth.uid()
        )
    );

CREATE POLICY "salons_update_owner" ON salons
    FOR UPDATE USING (
        profile_id IN (
            SELECT id FROM profiles WHERE account_id = auth.uid()
        )
    );

-- Marcel conversations policies
CREATE POLICY "marcel_conv_select" ON marcel_conversations
    FOR SELECT USING (
        account_id = auth.uid() OR
        auth.user_is_admin() OR
        auth.user_salon_id() IN (
            SELECT salon_id FROM appointments WHERE marcel_conversation_id = id
        )
    );

CREATE POLICY "marcel_conv_insert" ON marcel_conversations
    FOR INSERT WITH CHECK (true); -- Marcel can create for anyone

CREATE POLICY "marcel_conv_update" ON marcel_conversations
    FOR UPDATE USING (
        account_id = auth.uid() OR
        auth.user_is_admin()
    );

-- Marcel messages policies
CREATE POLICY "marcel_msg_select" ON marcel_messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM marcel_conversations
            WHERE account_id = auth.uid() OR auth.user_is_admin()
        )
    );

CREATE POLICY "marcel_msg_insert" ON marcel_messages
    FOR INSERT WITH CHECK (true); -- Marcel can insert messages

-- Appointments policies (refined)
DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
CREATE POLICY "appointments_select" ON appointments
    FOR SELECT USING (
        client_id = auth.uid() OR
        barbier_id IN (SELECT id FROM profiles WHERE account_id = auth.uid()) OR
        salon_id = auth.user_salon_id() OR
        auth.user_is_admin()
    );

CREATE POLICY "appointments_insert" ON appointments
    FOR INSERT WITH CHECK (
        client_id = auth.uid() OR
        auth.user_is_admin() OR
        auth.user_salon_id() = salon_id
    );

CREATE POLICY "appointments_update" ON appointments
    FOR UPDATE USING (
        client_id = auth.uid() OR
        barbier_id IN (SELECT id FROM profiles WHERE account_id = auth.uid()) OR
        salon_id = auth.user_salon_id() OR
        auth.user_is_admin()
    );

-- Formations policies (refined)
DROP POLICY IF EXISTS "Anyone can view published formations" ON formations;
CREATE POLICY "formations_select_published" ON formations
    FOR SELECT USING (
        status = 'published' OR
        formateur_id IN (SELECT id FROM profiles WHERE account_id = auth.uid()) OR
        auth.user_is_admin()
    );

DROP POLICY IF EXISTS "Formateurs can manage own formations" ON formations;
CREATE POLICY "formations_insert_formateur" ON formations
    FOR INSERT WITH CHECK (
        auth.user_is_formateur() AND
        formateur_id IN (SELECT id FROM profiles WHERE account_id = auth.uid())
    );

CREATE POLICY "formations_update_formateur" ON formations
    FOR UPDATE USING (
        formateur_id IN (SELECT id FROM profiles WHERE account_id = auth.uid()) OR
        auth.user_is_admin()
    );

CREATE POLICY "formations_delete_admin" ON formations
    FOR DELETE USING (auth.user_is_admin());

-- Modules policies
CREATE POLICY "modules_select" ON modules
    FOR SELECT USING (
        formation_id IN (
            SELECT id FROM formations WHERE status = 'published'
        ) OR
        formation_id IN (
            SELECT id FROM formations WHERE formateur_id IN (
                SELECT id FROM profiles WHERE account_id = auth.uid()
            )
        ) OR
        auth.user_is_admin()
    );

CREATE POLICY "modules_insert" ON modules
    FOR INSERT WITH CHECK (
        formation_id IN (
            SELECT id FROM formations WHERE formateur_id IN (
                SELECT id FROM profiles WHERE account_id = auth.uid()
            )
        ) OR
        auth.user_is_admin()
    );

CREATE POLICY "modules_update" ON modules
    FOR UPDATE USING (
        formation_id IN (
            SELECT id FROM formations WHERE formateur_id IN (
                SELECT id FROM profiles WHERE account_id = auth.uid()
            )
        ) OR
        auth.user_is_admin()
    );

-- Enrollments policies
CREATE POLICY "enrollments_select_own" ON enrollments
    FOR SELECT USING (
        profile_id IN (SELECT id FROM profiles WHERE account_id = auth.uid()) OR
        formation_id IN (
            SELECT id FROM formations WHERE formateur_id IN (
                SELECT id FROM profiles WHERE account_id = auth.uid()
            )
        ) OR
        auth.user_is_admin()
    );

CREATE POLICY "enrollments_insert_own" ON enrollments
    FOR INSERT WITH CHECK (
        profile_id IN (SELECT id FROM profiles WHERE account_id = auth.uid())
    );

CREATE POLICY "enrollments_update_own" ON enrollments
    FOR UPDATE USING (
        profile_id IN (SELECT id FROM profiles WHERE account_id = auth.uid()) OR
        auth.user_is_admin()
    );

-- Transactions policies
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "transactions_select_own" ON transactions
    FOR SELECT USING (
        account_id = auth.uid() OR
        revenue_share_recipient_id IN (
            SELECT id FROM profiles WHERE account_id = auth.uid()
        ) OR
        auth.user_is_admin()
    );

CREATE POLICY "transactions_insert_system" ON transactions
    FOR INSERT WITH CHECK (auth.user_is_admin()); -- Only system/admin can insert

-- Revenue analytics policies
CREATE POLICY "revenue_analytics_select" ON revenue_analytics
    FOR SELECT USING (
        auth.user_is_admin() OR
        auth.user_is_salon_owner() OR
        auth.user_is_formateur()
    );

-- Badges policies
CREATE POLICY "badges_select_all" ON badges
    FOR SELECT USING (true); -- Everyone can see badges

CREATE POLICY "badges_insert_admin" ON badges
    FOR INSERT WITH CHECK (auth.user_is_admin());

CREATE POLICY "badges_update_admin" ON badges
    FOR UPDATE USING (auth.user_is_admin());

-- User badges policies
CREATE POLICY "user_badges_select" ON user_badges
    FOR SELECT USING (
        profile_id IN (SELECT id FROM profiles WHERE account_id = auth.uid()) OR
        auth.user_is_admin()
    );

CREATE POLICY "user_badges_insert_system" ON user_badges
    FOR INSERT WITH CHECK (auth.user_is_admin()); -- Only system can award

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications
    FOR SELECT USING (
        profile_id IN (SELECT id FROM profiles WHERE account_id = auth.uid())
    );

CREATE POLICY "notifications_update_own" ON notifications
    FOR UPDATE USING (
        profile_id IN (SELECT id FROM profiles WHERE account_id = auth.uid())
    );

CREATE POLICY "notifications_insert_system" ON notifications
    FOR INSERT WITH CHECK (auth.user_is_admin()); -- System creates notifications

-- Analytics events policies
CREATE POLICY "analytics_events_insert_all" ON analytics_events
    FOR INSERT WITH CHECK (true); -- Anyone can track events

CREATE POLICY "analytics_events_select_own" ON analytics_events
    FOR SELECT USING (
        account_id = auth.uid() OR
        auth.user_is_admin()
    );

-- =====================================================
-- PERFORMANCE OPTIMIZATION FUNCTIONS
-- =====================================================

-- Function to get user's active subscriptions count
CREATE OR REPLACE FUNCTION get_active_subscriptions_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM accounts
        WHERE subscription_status = 'active'
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get today's revenue
CREATE OR REPLACE FUNCTION get_todays_revenue()
RETURNS DECIMAL AS $$
BEGIN
    RETURN (
        SELECT COALESCE(SUM(amount), 0)
        FROM transactions
        WHERE DATE(created_at) = CURRENT_DATE
        AND status = 'succeeded'
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get conversion rate for a period
CREATE OR REPLACE FUNCTION get_conversion_rate(days INTEGER DEFAULT 30)
RETURNS DECIMAL AS $$
DECLARE
    visitors INTEGER;
    conversions INTEGER;
BEGIN
    SELECT COUNT(DISTINCT session_id) INTO visitors
    FROM analytics_events
    WHERE created_at >= NOW() - INTERVAL '1 day' * days
    AND event_name = 'page_view';
    
    SELECT COUNT(DISTINCT account_id) INTO conversions
    FROM analytics_events
    WHERE created_at >= NOW() - INTERVAL '1 day' * days
    AND event_name IN ('subscription_started', 'course_enrolled');
    
    IF visitors = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN (conversions::DECIMAL / visitors) * 100;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- SCHEDULED JOBS (using pg_cron if available)
-- =====================================================

-- Daily analytics aggregation (run at 2 AM)
-- Note: Requires pg_cron extension
-- SELECT cron.schedule('daily-analytics', '0 2 * * *', $$
--     INSERT INTO revenue_analytics (date, mrr, daily_revenue, daily_transactions, daily_new_customers)
--     SELECT 
--         CURRENT_DATE - INTERVAL '1 day',
--         calculate_mrr(),
--         get_todays_revenue(),
--         COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'),
--         COUNT(DISTINCT account_id) FILTER (WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day')
--     FROM transactions
--     WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day';
-- $$);

-- =====================================================
-- AUDIT LOGGING
-- =====================================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    user_id UUID,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (table_name, operation, user_id, record_id, old_data, new_data)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        auth.uid(),
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_accounts AFTER INSERT OR UPDATE OR DELETE ON accounts
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_transactions AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_appointments AFTER INSERT OR UPDATE OR DELETE ON appointments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- INDEXES FOR REAL-TIME PERFORMANCE
-- =====================================================

-- Composite indexes for common queries
CREATE INDEX idx_appointments_composite ON appointments(salon_id, date, status);
CREATE INDEX idx_transactions_composite ON transactions(account_id, status, created_at DESC);
CREATE INDEX idx_enrollments_composite ON enrollments(profile_id, formation_id, progress_percentage);
CREATE INDEX idx_formations_composite ON formations(status, category, level);

-- Partial indexes for performance
CREATE INDEX idx_active_subscriptions ON accounts(subscription_status) 
    WHERE subscription_status = 'active';
CREATE INDEX idx_pending_appointments ON appointments(status, date) 
    WHERE status = 'pending';
CREATE INDEX idx_unread_notifications ON notifications(profile_id, created_at DESC) 
    WHERE read = false;

-- =====================================================
-- MATERIALIZED VIEWS FOR DASHBOARDS
-- =====================================================

-- Dashboard metrics view (refresh hourly)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_dashboard_metrics AS
SELECT
    calculate_mrr() as mrr,
    calculate_mrr() * 12 as arr,
    get_active_subscriptions_count() as active_subscribers,
    get_todays_revenue() as todays_revenue,
    get_conversion_rate(30) as monthly_conversion_rate,
    (
        SELECT COUNT(*) FROM accounts 
        WHERE created_at >= NOW() - INTERVAL '30 days'
    ) as new_users_30d,
    (
        SELECT AVG(lifetime_value) FROM accounts 
        WHERE lifetime_value > 0
    ) as avg_ltv,
    (
        SELECT COUNT(*) FROM appointments 
        WHERE date = CURRENT_DATE AND status != 'canceled'
    ) as todays_appointments,
    (
        SELECT COUNT(*) FROM enrollments 
        WHERE enrolled_at >= NOW() - INTERVAL '7 days'
    ) as weekly_enrollments,
    NOW() as last_updated
WITH DATA;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_mv_dashboard_metrics ON mv_dashboard_metrics(last_updated);

-- Function to refresh dashboard metrics
CREATE OR REPLACE FUNCTION refresh_dashboard_metrics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_metrics;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- NOTIFICATION SYSTEM
-- =====================================================

-- Function to send notification
CREATE OR REPLACE FUNCTION send_notification(
    p_profile_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'info'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (profile_id, title, message, type)
    VALUES (p_profile_id, p_title, p_message, p_type)
    RETURNING id INTO notification_id;
    
    -- Trigger real-time update
    PERFORM pg_notify('new_notification', json_build_object(
        'profile_id', p_profile_id,
        'notification_id', notification_id,
        'title', p_title
    )::text);
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DATA VALIDATION CONSTRAINTS
-- =====================================================

-- Ensure subscription dates are logical
ALTER TABLE accounts ADD CONSTRAINT check_subscription_dates
    CHECK (subscription_started_at IS NULL OR subscription_ends_at IS NULL OR 
           subscription_ends_at >= subscription_started_at);

-- Ensure appointment times are logical
ALTER TABLE appointments ADD CONSTRAINT check_appointment_times
    CHECK (end_time > start_time);

-- Ensure positive amounts
ALTER TABLE transactions ADD CONSTRAINT check_positive_amount
    CHECK (amount >= 0);

-- Ensure valid progress percentage
ALTER TABLE enrollments ADD CONSTRAINT check_progress_percentage
    CHECK (progress_percentage >= 0 AND progress_percentage <= 100);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION auth.user_is_admin() IS 'Check if current user has admin profile';
COMMENT ON FUNCTION auth.user_is_salon_owner() IS 'Check if current user owns a salon';
COMMENT ON FUNCTION auth.user_is_formateur() IS 'Check if current user is a formateur';
COMMENT ON FUNCTION calculate_mrr() IS 'Calculate current Monthly Recurring Revenue';
COMMENT ON FUNCTION get_conversion_rate(INTEGER) IS 'Calculate conversion rate for specified days';
COMMENT ON MATERIALIZED VIEW mv_dashboard_metrics IS 'Pre-calculated metrics for dashboard performance';