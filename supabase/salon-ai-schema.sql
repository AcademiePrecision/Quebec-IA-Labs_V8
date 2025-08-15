-- 🤖 SCHÉMA BASE DE DONNÉES - VALET IA SALON
-- Architecture optimisée pour l'Ingénieur AI invisible

-- =============================================
-- TABLES PRINCIPALES
-- =============================================

-- Salons
CREATE TABLE salons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    address TEXT,
    owner_id UUID REFERENCES auth.users(id),
    
    -- Configuration IA
    ai_voice_enabled BOOLEAN DEFAULT true,
    surveillance_level VARCHAR(20) DEFAULT 'basic' CHECK (surveillance_level IN ('basic', 'advanced', 'premium')),
    auto_pricing_enabled BOOLEAN DEFAULT false,
    conflict_prevention_enabled BOOLEAN DEFAULT true,
    
    -- Horaires business
    business_hours JSONB DEFAULT '[]',
    
    -- Personnalité IA
    ai_personality JSONB DEFAULT '{
        "voice_tone": "professional",
        "greeting_style": "warm",
        "upsell_aggressiveness": 5
    }',
    
    -- Métriques
    monthly_revenue DECIMAL(10,2) DEFAULT 0,
    client_satisfaction_avg DECIMAL(3,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Barbiers/Coiffeurs
CREATE TABLE barbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    
    -- Classification AI
    persona_type VARCHAR(20) DEFAULT 'dimitri' CHECK (persona_type IN ('marco', 'jessica', 'dimitri')),
    skill_level VARCHAR(20) DEFAULT 'junior' CHECK (skill_level IN ('junior', 'senior', 'expert')),
    is_premium BOOLEAN DEFAULT false,
    
    -- Performance
    commission_rate DECIMAL(5,2) DEFAULT 50.00,
    monthly_revenue DECIMAL(10,2) DEFAULT 0,
    efficiency_score DECIMAL(3,2) DEFAULT 0,
    client_satisfaction DECIMAL(3,2) DEFAULT 0,
    
    -- Horaires et préférences
    availability JSONB DEFAULT '[]',
    protected_slots JSONB DEFAULT '[]',
    max_clients_per_day INTEGER DEFAULT 12,
    
    -- Coaching IA
    coaching_frequency VARCHAR(20) DEFAULT 'weekly',
    last_coaching_date TIMESTAMP WITH TIME ZONE,
    improvement_areas JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients avec profiling IA
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL, -- Clé reconnaissance
    name VARCHAR(255),
    email VARCHAR(255),
    
    -- Classification IA automatique
    persona_type VARCHAR(20) CHECK (persona_type IN ('marie_claude', 'kevin', 'roger', 'sophie')),
    language VARCHAR(5) DEFAULT 'fr',
    
    -- Préférences
    preferred_barber_id UUID REFERENCES barbers(id),
    preferred_services JSONB DEFAULT '[]',
    preferred_times JSONB DEFAULT '[]',
    communication_style VARCHAR(20) DEFAULT 'casual' CHECK (communication_style IN ('formal', 'casual', 'minimal')),
    
    -- Profil IA comportemental
    patience_level INTEGER DEFAULT 5 CHECK (patience_level BETWEEN 1 AND 10),
    complexity_tolerance INTEGER DEFAULT 5,
    preferred_interaction_duration INTEGER DEFAULT 3, -- minutes
    requires_gentle_handling BOOLEAN DEFAULT false,
    
    -- Historique et métriques
    total_visits INTEGER DEFAULT 0,
    last_visit TIMESTAMP WITH TIME ZONE,
    average_spending DECIMAL(10,2) DEFAULT 0,
    satisfaction_score DECIMAL(3,2) DEFAULT 0,
    cancellation_rate DECIMAL(3,2) DEFAULT 0,
    
    -- Notes comportementales IA
    behavioral_notes JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services offerts
CREATE TABLE salon_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    base_price DECIMAL(8,2) NOT NULL,
    skill_level_required VARCHAR(20) DEFAULT 'junior',
    commission_rate DECIMAL(5,2) DEFAULT 50.00,
    
    -- Optimisation IA
    demand_multiplier DECIMAL(3,2) DEFAULT 1.00,
    upsell_priority INTEGER DEFAULT 1,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- RÉSERVATIONS INTELLIGENTES
-- =============================================

CREATE TABLE smart_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    barber_id UUID REFERENCES barbers(id),
    salon_id UUID REFERENCES salons(id),
    service_id UUID REFERENCES salon_services(id),
    
    -- Planification
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_duration INTEGER NOT NULL,
    actual_duration INTEGER,
    
    -- Pricing dynamique
    base_price DECIMAL(8,2) NOT NULL,
    final_price DECIMAL(8,2) NOT NULL,
    dynamic_pricing_applied BOOLEAN DEFAULT false,
    
    -- Métadonnées IA
    ai_metadata JSONB DEFAULT '{
        "confidence_score": 0.0,
        "conversation_summary": "",
        "client_mood": "neutral",
        "special_requests": [],
        "predicted_duration": 0,
        "upsell_opportunities": []
    }',
    
    -- Status et tracking
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'tentative', 'cancelled', 'completed', 'no_show')),
    optimization_score DECIMAL(3,2) DEFAULT 0,
    created_by_ai BOOLEAN DEFAULT false,
    
    -- Satisfaction client
    client_satisfaction INTEGER CHECK (client_satisfaction BETWEEN 1 AND 10),
    satisfaction_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modifications des réservations
CREATE TABLE booking_modifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES smart_bookings(id) ON DELETE CASCADE,
    modification_type VARCHAR(30) NOT NULL,
    reason TEXT,
    made_by_ai BOOLEAN DEFAULT false,
    client_satisfaction_impact INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CONVERSATIONS IA
-- =============================================

CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_phone VARCHAR(20) NOT NULL,
    salon_id UUID REFERENCES salons(id),
    
    -- Détails conversation
    duration INTEGER NOT NULL, -- secondes
    transcript TEXT,
    audio_file_url TEXT,
    
    -- Résultat
    outcome VARCHAR(30) NOT NULL CHECK (outcome IN ('booking_created', 'booking_modified', 'cancelled', 'complaint', 'information')),
    
    -- Analyse sentiments
    sentiment_analysis JSONB DEFAULT '{
        "initial_mood": "neutral",
        "final_mood": "neutral", 
        "satisfaction_score": 0,
        "escalation_needed": false
    }',
    
    -- Decisions prises par l''IA
    ai_decisions JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Décisions IA trackées
CREATE TABLE ai_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES ai_conversations(id),
    salon_id UUID REFERENCES salons(id),
    
    decision_type VARCHAR(30) NOT NULL,
    reasoning TEXT NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    result JSONB,
    
    -- Impact business
    revenue_impact DECIMAL(10,2) DEFAULT 0,
    client_satisfaction_impact INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SURVEILLANCE ET DÉTECTION CONFLITS
-- =============================================

CREATE TABLE conflict_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID REFERENCES salons(id),
    
    conflict_type VARCHAR(30) NOT NULL CHECK (conflict_type IN ('staff_tension', 'client_complaint', 'scheduling_conflict', 'payment_dispute')),
    severity VARCHAR(20) DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Parties impliquées
    parties_involved JSONB DEFAULT '[]',
    
    -- Analyse IA
    ai_analysis TEXT NOT NULL,
    suggested_resolution TEXT,
    confidence_score DECIMAL(3,2) DEFAULT 0,
    
    -- Status résolution
    status VARCHAR(20) DEFAULT 'detected' CHECK (status IN ('detected', 'resolving', 'resolved', 'escalated')),
    resolution_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE surveillance_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID REFERENCES salons(id),
    
    event_type VARCHAR(30) NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    description TEXT NOT NULL,
    
    -- Preuves
    evidence JSONB DEFAULT '[]', -- URLs photos, audio, etc.
    
    -- Flags
    requires_attention BOOLEAN DEFAULT false,
    owner_notified BOOLEAN DEFAULT false,
    
    -- Métadonnées
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ANALYTICS ET PERFORMANCE
-- =============================================

CREATE TABLE salon_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID REFERENCES salons(id),
    date DATE NOT NULL,
    
    -- Métriques core
    total_calls INTEGER DEFAULT 0,
    successful_bookings INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    average_call_duration INTEGER DEFAULT 0,
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    ai_decisions_made INTEGER DEFAULT 0,
    client_satisfaction_avg DECIMAL(3,2) DEFAULT 0,
    
    -- Métriques avancées
    no_show_rate DECIMAL(5,2) DEFAULT 0,
    upsell_success_rate DECIMAL(5,2) DEFAULT 0,
    conflict_incidents INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(salon_id, date)
);

CREATE TABLE barber_daily_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barber_id UUID REFERENCES barbers(id),
    salon_id UUID REFERENCES salons(id),
    date DATE NOT NULL,
    
    -- Performance quotidienne
    clients_served INTEGER DEFAULT 0,
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    efficiency_score DECIMAL(3,2) DEFAULT 0,
    client_satisfaction DECIMAL(3,2) DEFAULT 0,
    
    -- Temps de travail
    hours_worked DECIMAL(4,2) DEFAULT 0,
    break_time_minutes INTEGER DEFAULT 0,
    
    -- Coaching et alertes
    coaching_alerts JSONB DEFAULT '[]',
    performance_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(barber_id, date)
);

-- Insights générés par l'IA
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID REFERENCES salons(id),
    
    insight_type VARCHAR(30) NOT NULL CHECK (insight_type IN ('opportunity', 'warning', 'optimization', 'trend')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    impact_score INTEGER CHECK (impact_score BETWEEN 1 AND 10),
    
    -- Actions
    action_required BOOLEAN DEFAULT false,
    suggested_actions JSONB DEFAULT '[]',
    
    -- Statut
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
    
    -- Métadonnées
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- CONFIGURATION IA
-- =============================================

CREATE TABLE ai_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID REFERENCES salons(id) UNIQUE,
    
    -- Configuration voix
    voice_settings JSONB DEFAULT '{
        "provider": "elevenlabs",
        "voice_id": "fr-CA-female-1",
        "speaking_rate": 1.0,
        "pitch": 1.0,
        "language": "fr-CA"
    }',
    
    -- Paramètres comportementaux
    behavioral_settings JSONB DEFAULT '{
        "patience_level": 7,
        "upsell_frequency": 3,
        "conflict_intervention_threshold": 6,
        "premium_client_priority_boost": 2
    }',
    
    -- Règles business
    business_rules JSONB DEFAULT '{
        "max_advance_booking_days": 30,
        "min_booking_notice_hours": 2,
        "auto_confirm_regulars": true,
        "dynamic_pricing_enabled": false,
        "after_hours_emergency_calls": false
    }',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES POUR PERFORMANCE
-- =============================================

-- Recherche rapide clients par téléphone
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_persona ON clients(persona_type);

-- Réservations par salon et date
CREATE INDEX idx_bookings_salon_date ON smart_bookings(salon_id, scheduled_time);
CREATE INDEX idx_bookings_barber_date ON smart_bookings(barber_id, scheduled_time);
CREATE INDEX idx_bookings_client ON smart_bookings(client_id);
CREATE INDEX idx_bookings_status ON smart_bookings(status);

-- Analytics par salon et date
CREATE INDEX idx_analytics_salon_date ON salon_analytics(salon_id, date);
CREATE INDEX idx_barber_metrics_date ON barber_daily_metrics(barber_id, date);

-- Conversations IA
CREATE INDEX idx_conversations_salon ON ai_conversations(salon_id);
CREATE INDEX idx_conversations_phone ON ai_conversations(client_phone);

-- Surveillance et conflits
CREATE INDEX idx_conflicts_salon ON conflict_detections(salon_id);
CREATE INDEX idx_surveillance_salon ON surveillance_events(salon_id);
CREATE INDEX idx_surveillance_attention ON surveillance_events(requires_attention);

-- =============================================
-- TRIGGERS POUR AUTOMATION
-- =============================================

-- Mise à jour automatique updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON salons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_barbers_updated_at BEFORE UPDATE ON barbers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON smart_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FONCTIONS UTILITAIRES
-- =============================================

-- Fonction pour calculer le taux de conversion
CREATE OR REPLACE FUNCTION calculate_conversion_rate(salon_uuid UUID, date_param DATE)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_calls INTEGER;
    successful_bookings INTEGER;
BEGIN
    SELECT COALESCE(total_calls, 0), COALESCE(successful_bookings, 0)
    INTO total_calls, successful_bookings
    FROM salon_analytics 
    WHERE salon_id = salon_uuid AND date = date_param;
    
    IF total_calls = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN ROUND((successful_bookings::DECIMAL / total_calls::DECIMAL) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- POLITIQUES RLS (Row Level Security)
-- =============================================

-- Activer RLS sur toutes les tables sensibles
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveillance_events ENABLE ROW LEVEL SECURITY;

-- Politique pour propriétaires de salon
CREATE POLICY "Owners can manage their salons" ON salons
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Owners can manage their barbers" ON barbers
    FOR ALL USING (salon_id IN (
        SELECT id FROM salons WHERE owner_id = auth.uid()
    ));

-- =============================================
-- DONNÉES DE TEST (à supprimer en production)
-- =============================================

-- Configuration initiale pour tests
INSERT INTO ai_configurations (salon_id, voice_settings) VALUES
(gen_random_uuid(), '{
    "provider": "elevenlabs",
    "voice_id": "fr-CA-sylvie",
    "speaking_rate": 0.9,
    "pitch": 1.1,
    "language": "fr-CA"
}');