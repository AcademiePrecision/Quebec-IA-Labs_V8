// 🤖 TYPES POUR L'INGÉNIEUR AI - VALET PARFAIT

export interface Client {
  id: string;
  phone: string; // Clé unique pour reconnaissance
  name: string;
  preferences: {
    barber_preference?: string;
    services: string[];
    schedule_preferences: TimeSlot[];
    communication_style: 'formal' | 'casual' | 'minimal';
    language: 'fr' | 'en' | 'es';
  };
  history: {
    total_visits: number;
    last_visit: Date;
    average_spending: number;
    satisfaction_score: number;
    behavioral_notes: string[];
    cancellation_rate: number;
  };
  persona_type: 'marie_claude' | 'kevin' | 'roger' | 'sophie';
  ai_profile: {
    patience_level: number; // 1-10
    complexity_tolerance: number;
    preferred_interaction_duration: number;
    requires_gentle_handling: boolean;
  };
}

export interface Barber {
  id: string;
  name: string;
  salon_id: string;
  persona_type: 'marco' | 'jessica' | 'dimitri';
  performance: {
    revenue_percentage: number;
    efficiency_score: number;
    client_satisfaction: number;
    skill_level: 'junior' | 'senior' | 'expert';
    coaching_needs: string[];
    monthly_revenue: number;
  };
  schedule: {
    availability: TimeSlot[];
    protected_slots: TimeSlot[]; // Pour barbiers premium
    break_preferences: Duration[];
    max_clients_per_day: number;
  };
  ai_coaching: {
    last_feedback: Date;
    improvement_areas: string[];
    coaching_frequency: 'daily' | 'weekly' | 'on_demand';
    performance_trends: PerformanceTrend[];
  };
  commission_rate: number;
  is_premium: boolean;
}

export interface Salon {
  id: string;
  name: string;
  phone: string;
  address: string;
  owner_id: string;
  settings: {
    ai_voice_enabled: boolean;
    surveillance_level: 'basic' | 'advanced' | 'premium';
    auto_pricing_enabled: boolean;
    conflict_prevention_enabled: boolean;
  };
  business_hours: TimeSlot[];
  services: SalonService[];
  ai_personality: {
    voice_tone: 'professional' | 'friendly' | 'casual';
    greeting_style: 'formal' | 'warm' | 'efficient';
    upsell_aggressiveness: number; // 1-10
  };
}

export interface SmartBooking {
  id: string;
  client_id: string;
  barber_id: string;
  salon_id: string;
  scheduled_time: Date;
  service_type: string;
  estimated_duration: number;
  price: number;
  ai_metadata: {
    confidence_score: number;
    conversation_summary: string;
    client_mood: 'happy' | 'neutral' | 'frustrated' | 'angry';
    special_requests: string[];
    predicted_duration: number;
    upsell_opportunities: string[];
  };
  status: 'confirmed' | 'tentative' | 'cancelled' | 'completed' | 'no_show';
  optimization_score: number; // Rentabilité pour le salon
  created_by_ai: boolean;
  modifications: BookingModification[];
}

export interface AIConversation {
  id: string;
  client_phone: string;
  salon_id: string;
  timestamp: Date;
  duration: number;
  transcript: string;
  outcome: 'booking_created' | 'booking_modified' | 'cancelled' | 'complaint' | 'information';
  sentiment_analysis: {
    initial_mood: string;
    final_mood: string;
    satisfaction_score: number;
    escalation_needed: boolean;
  };
  ai_decisions: AIDecision[];
}

export interface AIDecision {
  timestamp: Date;
  decision_type: 'pricing' | 'scheduling' | 'barber_assignment' | 'conflict_resolution';
  reasoning: string;
  confidence: number;
  result: any;
}

export interface SalonAnalytics {
  salon_id: string;
  date: Date;
  metrics: {
    total_calls: number;
    successful_bookings: number;
    conversion_rate: number;
    average_call_duration: number;
    revenue_generated: number;
    ai_decisions_made: number;
    client_satisfaction_avg: number;
  };
  performance_by_barber: BarberDayMetrics[];
  ai_insights: AIInsight[];
}

export interface BarberDayMetrics {
  barber_id: string;
  clients_served: number;
  revenue_generated: number;
  efficiency_score: number;
  client_satisfaction: number;
  coaching_alerts: string[];
}

export interface AIInsight {
  type: 'opportunity' | 'warning' | 'optimization' | 'trend';
  title: string;
  description: string;
  impact_score: number;
  action_required: boolean;
  suggested_actions: string[];
}

export interface ConflictDetection {
  id: string;
  salon_id: string;
  type: 'staff_tension' | 'client_complaint' | 'scheduling_conflict' | 'payment_dispute';
  severity: 'low' | 'medium' | 'high' | 'critical';
  parties_involved: string[];
  ai_analysis: string;
  suggested_resolution: string;
  status: 'detected' | 'resolving' | 'resolved' | 'escalated';
  timestamp: Date;
}

export interface SurveillanceEvent {
  id: string;
  salon_id: string;
  timestamp: Date;
  event_type: 'cash_transaction' | 'unusual_behavior' | 'client_complaint' | 'extended_break';
  confidence: number;
  description: string;
  evidence: string[]; // Photos, audio clips, etc.
  requires_attention: boolean;
  owner_notified: boolean;
}

// Types utilitaires
export interface TimeSlot {
  start: string; // "09:00"
  end: string;   // "17:00"
  day_of_week?: number; // 0-6
}

export interface Duration {
  minutes: number;
}

export interface PerformanceTrend {
  metric: string;
  trend: 'improving' | 'declining' | 'stable';
  percentage_change: number;
  period: 'week' | 'month' | 'quarter';
}

export interface SalonService {
  id: string;
  name: string;
  duration_minutes: number;
  base_price: number;
  skill_level_required: 'junior' | 'senior' | 'expert';
  commission_rate: number;
}

export interface BookingModification {
  timestamp: Date;
  type: 'reschedule' | 'service_change' | 'barber_change' | 'cancellation';
  reason: string;
  made_by_ai: boolean;
  client_satisfaction_impact: number;
}

// Configuration IA
export interface AIConfiguration {
  salon_id: string;
  voice_settings: {
    provider: 'elevenlabs' | 'azure' | 'google';
    voice_id: string;
    speaking_rate: number;
    pitch: number;
    language: 'fr-CA' | 'en-CA' | 'es-MX';
  };
  behavioral_settings: {
    patience_level: number;
    upsell_frequency: number;
    conflict_intervention_threshold: number;
    premium_client_priority_boost: number;
  };
  business_rules: {
    max_advance_booking_days: number;
    min_booking_notice_hours: number;
    auto_confirm_regulars: boolean;
    dynamic_pricing_enabled: boolean;
    after_hours_emergency_calls: boolean;
  };
}

// Réponses API
export interface AICallResponse {
  success: boolean;
  booking_id?: string;
  action_taken: string;
  client_satisfaction_predicted: number;
  revenue_impact: number;
  follow_up_required: boolean;
  transcript: string;
}

export interface DashboardData {
  salon: Salon;
  today_stats: SalonAnalytics;
  active_bookings: SmartBooking[];
  barber_performance: BarberDayMetrics[];
  ai_insights: AIInsight[];
  recent_conflicts: ConflictDetection[];
  surveillance_alerts: SurveillanceEvent[];
}