-- =====================================================
-- SEED DATA & MIGRATION FROM MOCK DATA
-- =====================================================
-- Initial data for testing and development
-- =====================================================

-- =====================================================
-- SUBSCRIPTION TIERS CONFIGURATION
-- =====================================================

INSERT INTO badges (name, description, icon_url, criteria, rarity, points_value, auto_award_enabled, auto_award_rules)
VALUES
    ('Premier pas', 'Complété votre première formation', 'trophy', 'Complete 1 formation', 'common', 10, true, 
     '{"trigger": "course_completion", "minCourseCompletions": 1}'::jsonb),
    ('Étudiant assidu', 'Complété 5 formations', 'star', 'Complete 5 formations', 'rare', 50, true,
     '{"trigger": "course_completion", "minCourseCompletions": 5}'::jsonb),
    ('Expert barbier', 'Maîtrisé toutes les formations barbier', 'crown', 'Complete all barber courses', 'epic', 100, false, null),
    ('Mentor', 'Aidé 10 autres étudiants', 'people', 'Help 10 students', 'legendary', 200, false, null),
    ('Early Adopter', 'Parmi les 100 premiers utilisateurs', 'rocket', 'Join in first 100 users', 'epic', 75, false, null),
    ('Perfectionniste', 'Obtenu 100% dans 3 formations', 'diamond', 'Perfect score in 3 courses', 'rare', 60, true,
     '{"trigger": "course_completion", "minPerfectScores": 3}'::jsonb);

-- =====================================================
-- TEST ACCOUNTS & PROFILES
-- =====================================================

-- Admin account
INSERT INTO accounts (id, email, phone, first_name, last_name, preferred_language, subscription_tier, subscription_status)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'admin@academie-precision.com', '+15141234567', 'Admin', 'System', 'fr', 'enterprise', 'active');

INSERT INTO profiles (account_id, user_type, is_active, is_primary, admin_access_code, department)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'admin', true, true, 'ADMIN2024', 'Technology');

-- Salon owner account
INSERT INTO accounts (id, email, phone, first_name, last_name, preferred_language, subscription_tier, subscription_status, total_spent, lifetime_value)
VALUES 
    ('22222222-2222-2222-2222-222222222222', 'tony@elitebarbershop.com', '+15145551001', 'Tony', 'Moreau', 'fr', 'pro', 'active', 237.00, 474.00);

INSERT INTO profiles (id, account_id, user_type, is_active, is_primary, 
                     salon_name, salon_address, business_number, employee_count, years_experience)
VALUES 
    ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'salon_partenaire', true, true,
     'Elite Barbershop', '1234 Rue Saint-Denis, Montréal, QC', '123456789', 5, 8);

INSERT INTO salons (id, profile_id, name, address, phone, email, revenue_share_percentage, total_bookings, total_revenue, average_rating)
VALUES 
    ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 
     'Elite Barbershop', '1234 Rue Saint-Denis, Montréal, QC', '514-555-1001', 'contact@elitebarbershop.com',
     60.00, 342, 15750.00, 4.8);

-- Formateur accounts
INSERT INTO accounts (id, email, phone, first_name, last_name, preferred_language, subscription_tier, subscription_status)
VALUES 
    ('55555555-5555-5555-5555-555555555555', 'marco@academie-precision.com', '+15145552001', 'Marco', 'Gagnon', 'fr', 'pro', 'active'),
    ('66666666-6666-6666-6666-666666666666', 'julie@academie-precision.com', '+15145552002', 'Julie', 'Tremblay', 'fr', 'pro', 'active');

INSERT INTO profiles (id, account_id, user_type, is_active, is_primary,
                     specialties, years_experience, certifications, hourly_rate, professional_bio, attached_salon_id, rating, review_count)
VALUES 
    ('77777777-7777-7777-7777-777777777777', '55555555-5555-5555-5555-555555555555', 'maitre_formateur', true, true,
     ARRAY['Barbe traditionnelle', 'Rasage classique'], 8, ARRAY['Master Barber Certification'], 
     45.00, 'Expert en techniques traditionnelles avec 8 ans d''expérience', '44444444-4444-4444-4444-444444444444', 4.9, 127),
    ('88888888-8888-8888-8888-888888888888', '66666666-6666-6666-6666-666666666666', 'maitre_formateur', true, true,
     ARRAY['Colorations', 'Coupes femmes', 'Traitements'], 10, ARRAY['Colorist Specialist', 'Hair Design Expert'],
     50.00, 'Spécialiste en coloration et design capillaire', '44444444-4444-4444-4444-444444444444', 4.8, 89);

-- Student accounts
INSERT INTO accounts (id, email, phone, first_name, last_name, preferred_language, subscription_tier, subscription_status)
VALUES 
    ('99999999-9999-9999-9999-999999999999', 'jean.tremblay@gmail.com', '+15145551234', 'Jean', 'Tremblay', 'fr', 'basic', 'active'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'marie.gagnon@outlook.com', '+14385556789', 'Marie', 'Gagnon', 'fr', 'pro', 'active');

INSERT INTO profiles (account_id, user_type, is_active, is_primary,
                     experience_level, specialties_of_interest, training_goals, monthly_training_budget)
VALUES 
    ('99999999-9999-9999-9999-999999999999', 'academicien_barbier', true, true,
     'intermediaire', ARRAY['Coupe moderne', 'Barbe'], 'Perfectionner mes techniques de coupe', 200.00),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'academicien_barbier', true, true,
     'avance', ARRAY['Coloration', 'Styling'], 'Devenir expert en coloration', 300.00);

-- =====================================================
-- FORMATIONS (COURSES)
-- =====================================================

INSERT INTO formations (id, title, description, category, level, price, duration_hours,
                        formateur_id, status, published_at, enrollment_count, average_rating, total_revenue)
VALUES
    ('f1111111-1111-1111-1111-111111111111', 
     'Techniques de barbe professionnelles',
     'Maîtrisez l''art de la taille de barbe avec les techniques les plus avancées du métier.',
     'barbier', 'intermediaire', 149.00, 8,
     '77777777-7777-7777-7777-777777777777', 'published', NOW() - INTERVAL '30 days',
     340, 4.8, 50660.00),
    
    ('f2222222-2222-2222-2222-222222222222',
     'Coupe dégradée moderne',
     'Apprenez les dernières tendances en matière de coupe dégradée et fade.',
     'barbier', 'avance', 199.00, 12,
     '88888888-8888-8888-8888-888888888888', 'published', NOW() - INTERVAL '25 days',
     256, 4.6, 50944.00),
    
    ('f3333333-3333-3333-3333-333333333333',
     'Coloration créative pour hommes',
     'Techniques modernes de coloration masculine. Créez des looks uniques et tendances.',
     'barbier', 'intermediaire', 189.00, 10,
     '88888888-8888-8888-8888-888888888888', 'pending_approval', NOW() - INTERVAL '2 days',
     0, 0, 0);

-- =====================================================
-- MODULES
-- =====================================================

INSERT INTO modules (formation_id, title, description, duration_minutes, order_index)
VALUES
    ('f1111111-1111-1111-1111-111111111111', 'Introduction aux outils de barbe', 'Découvrez les différents outils et leur utilisation', 45, 1),
    ('f1111111-1111-1111-1111-111111111111', 'Techniques de taille avancées', 'Maîtrisez les techniques de taille professionnelles', 60, 2),
    ('f1111111-1111-1111-1111-111111111111', 'Entretien et finition', 'Apprenez les techniques de finition parfaite', 40, 3),
    
    ('f2222222-2222-2222-2222-222222222222', 'Bases du dégradé', 'Comprendre les principes du dégradé', 50, 1),
    ('f2222222-2222-2222-2222-222222222222', 'Techniques de fade avancées', 'Maîtrisez les fades complexes', 70, 2),
    ('f2222222-2222-2222-2222-222222222222', 'Styling et finition', 'Perfectionnez le styling moderne', 55, 3);

-- =====================================================
-- ENROLLMENTS
-- =====================================================

INSERT INTO enrollments (profile_id, formation_id, progress_percentage, enrolled_at, payment_amount, payment_status)
VALUES
    ((SELECT id FROM profiles WHERE account_id = '99999999-9999-9999-9999-999999999999' AND user_type = 'academicien_barbier'),
     'f1111111-1111-1111-1111-111111111111', 65.00, NOW() - INTERVAL '15 days', 149.00, 'succeeded'),
    
    ((SELECT id FROM profiles WHERE account_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND user_type = 'academicien_barbier'),
     'f1111111-1111-1111-1111-111111111111', 100.00, NOW() - INTERVAL '20 days', 149.00, 'succeeded'),
    
    ((SELECT id FROM profiles WHERE account_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND user_type = 'academicien_barbier'),
     'f2222222-2222-2222-2222-222222222222', 30.00, NOW() - INTERVAL '10 days', 199.00, 'succeeded');

-- =====================================================
-- APPOINTMENTS FROM MARCEL DATA
-- =====================================================

INSERT INTO appointments (client_id, salon_id, barbier_id, date, start_time, end_time, 
                         services, total_price, status, booking_source)
VALUES
    ('99999999-9999-9999-9999-999999999999', '44444444-4444-4444-4444-444444444444', '77777777-7777-7777-7777-777777777777',
     CURRENT_DATE + INTERVAL '2 days', '14:00', '15:00', ARRAY['Coupe', 'Barbe'], 55.00, 'confirmed', 'marcel_ai'),
    
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', '88888888-8888-8888-8888-888888888888',
     CURRENT_DATE + INTERVAL '3 days', '15:30', '17:00', ARRAY['Coupe', 'Coloration'], 85.00, 'confirmed', 'app'),
    
    ('99999999-9999-9999-9999-999999999999', '44444444-4444-4444-4444-444444444444', '77777777-7777-7777-7777-777777777777',
     CURRENT_DATE - INTERVAL '15 days', '10:00', '10:30', ARRAY['Rasage complet'], 35.00, 'completed', 'phone');

-- =====================================================
-- TRANSACTIONS HISTORY
-- =====================================================

INSERT INTO transactions (account_id, type, amount, currency, status, formation_id, 
                         payment_method, description, created_at, processed_at)
VALUES
    ('99999999-9999-9999-9999-999999999999', 'subscription', 29.00, 'CAD', 'succeeded',
     NULL, 'card', 'Abonnement Basic - Mensuel', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
    
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'subscription', 79.00, 'CAD', 'succeeded',
     NULL, 'card', 'Abonnement Pro - Mensuel', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
    
    ('99999999-9999-9999-9999-999999999999', 'course_purchase', 149.00, 'CAD', 'succeeded',
     'f1111111-1111-1111-1111-111111111111', 'card', 'Achat formation: Techniques de barbe', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
    
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'course_purchase', 149.00, 'CAD', 'succeeded',
     'f1111111-1111-1111-1111-111111111111', 'card', 'Achat formation: Techniques de barbe', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
    
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'course_purchase', 199.00, 'CAD', 'succeeded',
     'f2222222-2222-2222-2222-222222222222', 'card', 'Achat formation: Coupe dégradée', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
    
    ('99999999-9999-9999-9999-999999999999', 'appointment', 35.00, 'CAD', 'succeeded',
     NULL, 'card', 'Paiement RDV: Rasage complet', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days');

-- =====================================================
-- MARCEL CONVERSATION SAMPLES
-- =====================================================

INSERT INTO marcel_conversations (account_id, phone_number, session_id, is_recognized_client, 
                                 client_name, preferred_language, message_count, conversion_achieved)
VALUES
    ('99999999-9999-9999-9999-999999999999', '+15145551234', 'marcel_1234567890_15145551234', true,
     'Jean Tremblay', 'fr', 5, true),
    
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '+14385556789', 'marcel_1234567891_14385556789', true,
     'Marie Gagnon', 'fr', 3, false),
    
    (NULL, '+15149998888', 'marcel_1234567892_15149998888', false,
     NULL, 'en', 2, false);

-- =====================================================
-- INITIAL REVENUE ANALYTICS
-- =====================================================

INSERT INTO revenue_analytics (date, daily_revenue, daily_transactions, daily_new_customers,
                              mrr, arr, subscription_revenue, course_revenue, appointment_revenue)
VALUES
    (CURRENT_DATE - INTERVAL '1 day', 543.00, 6, 2, 187.00, 2244.00, 187.00, 298.00, 58.00),
    (CURRENT_DATE - INTERVAL '2 days', 412.00, 4, 1, 187.00, 2244.00, 79.00, 298.00, 35.00),
    (CURRENT_DATE - INTERVAL '3 days', 298.00, 2, 0, 187.00, 2244.00, 0.00, 298.00, 0.00),
    (CURRENT_DATE - INTERVAL '7 days', 755.00, 8, 3, 158.00, 1896.00, 158.00, 497.00, 100.00),
    (CURRENT_DATE - INTERVAL '14 days', 623.00, 7, 2, 108.00, 1296.00, 108.00, 447.00, 68.00),
    (CURRENT_DATE - INTERVAL '30 days', 892.00, 10, 4, 79.00, 948.00, 79.00, 745.00, 68.00);

-- =====================================================
-- SAMPLE NOTIFICATIONS
-- =====================================================

INSERT INTO notifications (profile_id, title, message, type, read)
SELECT 
    p.id,
    'Bienvenue sur Académie Précision!',
    'Nous sommes ravis de vous accueillir. Découvrez nos formations et commencez votre parcours d''apprentissage.',
    'success',
    false
FROM profiles p
WHERE p.user_type = 'academicien_barbier';

INSERT INTO notifications (profile_id, title, message, type, read)
SELECT 
    p.id,
    'Nouvelle formation disponible',
    'La formation "Techniques de barbe professionnelles" est maintenant disponible!',
    'info',
    false
FROM profiles p
WHERE p.user_type = 'academicien_barbier';

-- =====================================================
-- ANALYTICS EVENTS SAMPLES
-- =====================================================

-- Generate sample page views
INSERT INTO analytics_events (account_id, session_id, event_name, event_category, event_properties, platform)
SELECT 
    a.id,
    'session_' || generate_series || '_' || a.id,
    'page_view',
    'navigation',
    jsonb_build_object('page', CASE (random() * 4)::int
        WHEN 0 THEN '/dashboard'
        WHEN 1 THEN '/formations'
        WHEN 2 THEN '/appointments'
        WHEN 3 THEN '/profile'
        ELSE '/home'
    END),
    CASE (random() * 3)::int
        WHEN 0 THEN 'ios'
        WHEN 1 THEN 'android'
        ELSE 'web'
    END
FROM accounts a
CROSS JOIN generate_series(1, 5);

-- Generate conversion events
INSERT INTO analytics_events (account_id, session_id, event_name, event_category, event_properties, platform, created_at)
VALUES
    ('99999999-9999-9999-9999-999999999999', 'session_conversion_1', 'subscription_started', 'conversion',
     '{"tier": "basic", "amount": 29}'::jsonb, 'ios', NOW() - INTERVAL '30 days'),
    
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'session_conversion_2', 'subscription_started', 'conversion',
     '{"tier": "pro", "amount": 79}'::jsonb, 'android', NOW() - INTERVAL '30 days'),
    
    ('99999999-9999-9999-9999-999999999999', 'session_conversion_3', 'course_enrolled', 'conversion',
     '{"courseId": "f1111111-1111-1111-1111-111111111111", "price": 149}'::jsonb, 'ios', NOW() - INTERVAL '15 days');

-- =====================================================
-- REFRESH MATERIALIZED VIEWS
-- =====================================================

-- Refresh dashboard metrics
REFRESH MATERIALIZED VIEW mv_dashboard_metrics;

-- =====================================================
-- FINAL STATISTICS
-- =====================================================

DO $$
DECLARE
    total_accounts INTEGER;
    total_profiles INTEGER;
    total_formations INTEGER;
    total_appointments INTEGER;
    total_revenue DECIMAL;
    current_mrr DECIMAL;
BEGIN
    SELECT COUNT(*) INTO total_accounts FROM accounts;
    SELECT COUNT(*) INTO total_profiles FROM profiles;
    SELECT COUNT(*) INTO total_formations FROM formations;
    SELECT COUNT(*) INTO total_appointments FROM appointments;
    SELECT SUM(amount) INTO total_revenue FROM transactions WHERE status = 'succeeded';
    SELECT calculate_mrr() INTO current_mrr;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SEED DATA LOADED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total Accounts: %', total_accounts;
    RAISE NOTICE 'Total Profiles: %', total_profiles;
    RAISE NOTICE 'Total Formations: %', total_formations;
    RAISE NOTICE 'Total Appointments: %', total_appointments;
    RAISE NOTICE 'Total Revenue: $%', total_revenue;
    RAISE NOTICE 'Current MRR: $%', current_mrr;
    RAISE NOTICE '========================================';
END $$;