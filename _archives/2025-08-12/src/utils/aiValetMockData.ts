// 🧪 DONNÉES DE TEST - PROTOTYPE MVP VALET IA
// 3 salons pilotes pour validation du concept

import { 
  Salon, 
  Barber, 
  Client, 
  SmartBooking, 
  DashboardData,
  AIInsight,
  SurveillanceEvent,
  ConflictDetection 
} from '../types/salon-ai';

// 🏪 SALONS PILOTES
export const mockSalons: Salon[] = [
  {
    id: 'salon-001-tony',
    name: 'Salon Tony & Co',
    phone: '+15149876543',
    address: '1234 Rue Saint-Denis, Montréal, QC H2X 3K8',
    owner_id: 'owner-tony-001',
    settings: {
      ai_voice_enabled: true,
      surveillance_level: 'advanced',
      auto_pricing_enabled: true,
      conflict_prevention_enabled: true
    },
    business_hours: [
      { start: '09:00', end: '18:00', day_of_week: 1 }, // Lundi
      { start: '09:00', end: '18:00', day_of_week: 2 }, // Mardi
      { start: '09:00', end: '18:00', day_of_week: 3 }, // Mercredi
      { start: '09:00', end: '20:00', day_of_week: 4 }, // Jeudi
      { start: '08:00', end: '20:00', day_of_week: 5 }, // Vendredi
      { start: '08:00', end: '17:00', day_of_week: 6 }, // Samedi
    ],
    services: [
      {
        id: 'service-001',
        name: 'Coupe Homme',
        duration_minutes: 30,
        base_price: 35.00,
        skill_level_required: 'junior',
        commission_rate: 60.00
      },
      {
        id: 'service-002',
        name: 'Coupe + Barbe',
        duration_minutes: 45,
        base_price: 55.00,
        skill_level_required: 'senior',
        commission_rate: 65.00
      },
      {
        id: 'service-003',
        name: 'Coloration',
        duration_minutes: 90,
        base_price: 85.00,
        skill_level_required: 'expert',
        commission_rate: 70.00
      }
    ],
    ai_personality: {
      voice_tone: 'professional',
      greeting_style: 'warm',
      upsell_aggressiveness: 6
    }
  },
  {
    id: 'salon-002-marie',
    name: 'Coiffure Marie - Succursale Centre',
    phone: '+15142345678',
    address: '5678 Boulevard Saint-Laurent, Montréal, QC H2T 1S1',
    owner_id: 'owner-marie-002',
    settings: {
      ai_voice_enabled: true,
      surveillance_level: 'premium',
      auto_pricing_enabled: true,
      conflict_prevention_enabled: true
    },
    business_hours: [
      { start: '08:00', end: '19:00', day_of_week: 1 },
      { start: '08:00', end: '19:00', day_of_week: 2 },
      { start: '08:00', end: '19:00', day_of_week: 3 },
      { start: '08:00', end: '21:00', day_of_week: 4 },
      { start: '07:00', end: '21:00', day_of_week: 5 },
      { start: '07:00', end: '18:00', day_of_week: 6 },
      { start: '10:00', end: '16:00', day_of_week: 0 }, // Dimanche
    ],
    services: [
      {
        id: 'service-004',
        name: 'Coupe Femme',
        duration_minutes: 45,
        base_price: 65.00,
        skill_level_required: 'senior',
        commission_rate: 55.00
      },
      {
        id: 'service-005',
        name: 'Coupe + Couleur',
        duration_minutes: 120,
        base_price: 125.00,
        skill_level_required: 'expert',
        commission_rate: 60.00
      },
      {
        id: 'service-006',
        name: 'Manucure',
        duration_minutes: 60,
        base_price: 45.00,
        skill_level_required: 'junior',
        commission_rate: 50.00
      }
    ],
    ai_personality: {
      voice_tone: 'friendly',
      greeting_style: 'efficient',
      upsell_aggressiveness: 8
    }
  },
  {
    id: 'salon-003-boutique',
    name: 'Boutique Barbier Moderne',
    phone: '+15143456789',
    address: '9012 Avenue du Parc, Montréal, QC H2N 1X7',
    owner_id: 'owner-jean-003',
    settings: {
      ai_voice_enabled: true,
      surveillance_level: 'basic',
      auto_pricing_enabled: false,
      conflict_prevention_enabled: true
    },
    business_hours: [
      { start: '10:00', end: '19:00', day_of_week: 2 }, // Mardi
      { start: '10:00', end: '19:00', day_of_week: 3 }, // Mercredi
      { start: '10:00', end: '21:00', day_of_week: 4 }, // Jeudi
      { start: '09:00', end: '21:00', day_of_week: 5 }, // Vendredi
      { start: '08:00', end: '18:00', day_of_week: 6 }, // Samedi
    ],
    services: [
      {
        id: 'service-007',
        name: 'Coupe Signature',
        duration_minutes: 40,
        base_price: 45.00,
        skill_level_required: 'expert',
        commission_rate: 70.00
      },
      {
        id: 'service-008',
        name: 'Rasage Traditionnel',
        duration_minutes: 30,
        base_price: 35.00,
        skill_level_required: 'senior',
        commission_rate: 65.00
      }
    ],
    ai_personality: {
      voice_tone: 'casual',
      greeting_style: 'friendly',
      upsell_aggressiveness: 4
    }
  }
];

// ✂️ BARBIERS DE TEST
export const mockBarbers: Barber[] = [
  // Salon Tony & Co
  {
    id: 'barber-001-marco',
    salon_id: 'salon-001-tony',
    name: 'Marco Tremblay',
    persona_type: 'marco',
    skill_level: 'expert',
    is_premium: true,
    commission_rate: 65.00,
    monthly_revenue: 4200.00,
    efficiency_score: 9.2,
    client_satisfaction: 9.5,
    availability: [
      { start: '09:00', end: '18:00', day_of_week: 1 },
      { start: '09:00', end: '18:00', day_of_week: 2 },
      { start: '09:00', end: '18:00', day_of_week: 3 },
      { start: '09:00', end: '20:00', day_of_week: 4 },
      { start: '08:00', end: '20:00', day_of_week: 5 },
      { start: '08:00', end: '16:00', day_of_week: 6 },
    ],
    protected_slots: [
      { start: '12:00', end: '13:00' }, // Lunch protégé
      { start: '15:00', end: '15:15' }, // Pause
    ],
    max_clients_per_day: 14,
    ai_coaching: {
      last_feedback: new Date('2024-01-15'),
      improvement_areas: [],
      coaching_frequency: 'weekly',
      performance_trends: [
        { metric: 'efficiency', trend: 'improving', percentage_change: 5.2, period: 'month' },
        { metric: 'satisfaction', trend: 'stable', percentage_change: 0.8, period: 'month' }
      ]
    },
    performance: {
      revenue_percentage: 42,
      efficiency_score: 9.2,
      client_satisfaction: 9.5,
      skill_level: 'expert',
      coaching_needs: [],
      monthly_revenue: 4200.00
    }
  },
  {
    id: 'barber-002-jessica',
    salon_id: 'salon-001-tony',
    name: 'Jessica Dubois',
    persona_type: 'jessica',
    skill_level: 'junior',
    is_premium: false,
    commission_rate: 50.00,
    monthly_revenue: 1800.00,
    efficiency_score: 6.8,
    client_satisfaction: 8.2,
    availability: [
      { start: '10:00', end: '18:00', day_of_week: 1 },
      { start: '10:00', end: '18:00', day_of_week: 2 },
      { start: '10:00', end: '18:00', day_of_week: 3 },
      { start: '10:00', end: '20:00', day_of_week: 4 },
      { start: '09:00', end: '19:00', day_of_week: 5 },
      { start: '09:00', end: '17:00', day_of_week: 6 },
    ],
    protected_slots: [],
    max_clients_per_day: 10,
    ai_coaching: {
      last_feedback: new Date('2024-01-20'),
      improvement_areas: ['upselling', 'time_management', 'client_communication'],
      coaching_frequency: 'daily',
      performance_trends: [
        { metric: 'efficiency', trend: 'improving', percentage_change: 15.3, period: 'month' },
        { metric: 'confidence', trend: 'improving', percentage_change: 22.1, period: 'month' }
      ]
    },
    performance: {
      revenue_percentage: 18,
      efficiency_score: 6.8,
      client_satisfaction: 8.2,
      skill_level: 'junior',
      coaching_needs: ['pricing_confidence', 'service_recommendations'],
      monthly_revenue: 1800.00
    }
  },
  {
    id: 'barber-003-dimitri',
    salon_id: 'salon-001-tony',
    name: 'Dimitri Kostas',
    persona_type: 'dimitri',
    skill_level: 'senior',
    is_premium: false,
    commission_rate: 60.00,
    monthly_revenue: 3100.00,
    efficiency_score: 8.5,
    client_satisfaction: 8.8,
    availability: [
      { start: '09:00', end: '18:00', day_of_week: 1 },
      { start: '09:00', end: '18:00', day_of_week: 2 },
      { start: '09:00', end: '18:00', day_of_week: 3 },
      { start: '09:00', end: '20:00', day_of_week: 4 },
      { start: '08:00', end: '20:00', day_of_week: 5 },
      { start: '08:00', end: '17:00', day_of_week: 6 },
    ],
    protected_slots: [],
    max_clients_per_day: 12,
    ai_coaching: {
      last_feedback: new Date('2024-01-18'),
      improvement_areas: ['premium_service_upsells'],
      coaching_frequency: 'weekly',
      performance_trends: [
        { metric: 'revenue', trend: 'improving', percentage_change: 8.7, period: 'month' }
      ]
    },
    performance: {
      revenue_percentage: 31,
      efficiency_score: 8.5,
      client_satisfaction: 8.8,
      skill_level: 'senior',
      coaching_needs: ['premium_positioning'],
      monthly_revenue: 3100.00
    }
  }
];

// 👥 CLIENTS DE TEST (DIFFÉRENTS PERSONAS)
export const mockClients: Client[] = [
  // Persona Marie-Claude (Professionnelle régulière)
  {
    id: 'client-001-marie-claude',
    phone: '+15149876543',
    name: 'Marie-Claude Bouchard',
    email: 'mcbouchard@example.com',
    persona_type: 'marie_claude',
    language: 'fr',
    preferred_barber_id: 'barber-001-marco',
    preferred_services: ['coupe', 'coloration'],
    preferred_times: [
      { start: '17:30', end: '18:30', day_of_week: 2 } // Mardi 17h30
    ],
    communication_style: 'formal',
    patience_level: 7,
    complexity_tolerance: 8,
    preferred_interaction_duration: 2,
    requires_gentle_handling: false,
    total_visits: 24,
    last_visit: new Date('2024-01-10'),
    average_spending: 95.00,
    satisfaction_score: 9.2,
    cancellation_rate: 0.15,
    behavioral_notes: [
      'Préfère confirmation SMS 24h avant',
      'Toujours ponctuelle',
      'N\'aime pas attendre',
      'Fidèle à Marco depuis 2 ans'
    ],
    ai_profile: {
      patience_level: 7,
      complexity_tolerance: 8,
      preferred_interaction_duration: 2,
      requires_gentle_handling: false
    },
    preferences: {
      barber_preference: 'barber-001-marco',
      services: ['coupe', 'coloration'],
      schedule_preferences: [
        { start: '17:30', end: '18:30', day_of_week: 2 }
      ],
      communication_style: 'formal',
      language: 'fr'
    },
    history: {
      total_visits: 24,
      last_visit: new Date('2024-01-10'),
      average_spending: 95.00,
      satisfaction_score: 9.2,
      behavioral_notes: [
        'Préfère confirmation SMS 24h avant',
        'Toujours ponctuelle',
        'N\'aime pas attendre',
        'Fidèle à Marco depuis 2 ans'
      ]
    }
  },
  // Persona Roger (Client difficile)
  {
    id: 'client-002-roger',
    phone: '+15142345678',
    name: 'Roger Martineau',
    email: 'rmartineau@example.com',
    persona_type: 'roger',
    language: 'fr',
    preferred_barber_id: 'barber-003-dimitri',
    preferred_services: ['coupe'],
    preferred_times: [
      { start: '09:00', end: '10:00', day_of_week: 6 } // Samedi matin
    ],
    communication_style: 'formal',
    patience_level: 3,
    complexity_tolerance: 2,
    preferred_interaction_duration: 1,
    requires_gentle_handling: true,
    total_visits: 156,
    last_visit: new Date('2024-01-18'),
    average_spending: 35.00,
    satisfaction_score: 6.8,
    cancellation_rate: 0.05,
    behavioral_notes: [
      'Client depuis 20 ans',
      'Très impatient au téléphone',
      'N\'accepte que Dimitri ou Marco',
      'Critique souvent mais reste fidèle',
      'Raccroche si attente >30 secondes'
    ],
    ai_profile: {
      patience_level: 3,
      complexity_tolerance: 2,
      preferred_interaction_duration: 1,
      requires_gentle_handling: true
    },
    preferences: {
      barber_preference: 'barber-003-dimitri',
      services: ['coupe'],
      schedule_preferences: [
        { start: '09:00', end: '10:00', day_of_week: 6 }
      ],
      communication_style: 'formal',
      language: 'fr'
    },
    history: {
      total_visits: 156,
      last_visit: new Date('2024-01-18'),
      average_spending: 35.00,
      satisfaction_score: 6.8,
      behavioral_notes: [
        'Client depuis 20 ans',
        'Très impatient au téléphone',
        'N\'accepte que Dimitri ou Marco',
        'Critique souvent mais reste fidèle',
        'Raccroche si attente >30 secondes'
      ]
    }
  },
  // Persona Kevin (Nouveau client nerveux)
  {
    id: 'client-003-kevin',
    phone: '+15143456789',
    name: 'Kevin Laberge',
    email: 'klaverge@example.com',
    persona_type: 'kevin',
    language: 'fr',
    preferred_barber_id: null,
    preferred_services: ['coupe'],
    preferred_times: [],
    communication_style: 'casual',
    patience_level: 8,
    complexity_tolerance: 4,
    preferred_interaction_duration: 5,
    requires_gentle_handling: true,
    total_visits: 3,
    last_visit: new Date('2024-01-08'),
    average_spending: 35.00,
    satisfaction_score: 8.5,
    cancellation_rate: 0.33,
    behavioral_notes: [
      'Nouveau client, 3ème visite',
      'Pose beaucoup de questions',
      'Sensible aux prix',
      'Influences par avis en ligne',
      'Hésitant sur services additionnels'
    ],
    ai_profile: {
      patience_level: 8,
      complexity_tolerance: 4,
      preferred_interaction_duration: 5,
      requires_gentle_handling: true
    },
    preferences: {
      services: ['coupe'],
      schedule_preferences: [],
      communication_style: 'casual',
      language: 'fr'
    },
    history: {
      total_visits: 3,
      last_visit: new Date('2024-01-08'),
      average_spending: 35.00,
      satisfaction_score: 8.5,
      behavioral_notes: [
        'Nouveau client, 3ème visite',
        'Pose beaucoup de questions',
        'Sensible aux prix',
        'Influences par avis en ligne',
        'Hésitant sur services additionnels'
      ]
    }
  }
];

// 📊 DONNÉES DASHBOARD COMPLÈTES
export const mockDashboardData: { [salonId: string]: DashboardData } = {
  'salon-001-tony': {
    salon: mockSalons[0],
    today_stats: {
      salon_id: 'salon-001-tony',
      date: new Date(),
      metrics: {
        total_calls: 47,
        successful_bookings: 39,
        conversion_rate: 82.98,
        average_call_duration: 127, // secondes
        revenue_generated: 1365.00,
        ai_decisions_made: 84,
        client_satisfaction_avg: 8.7,
        no_show_rate: 5.1,
        upsell_success_rate: 23.5,
        conflict_incidents: 1
      }
    },
    active_bookings: [
      {
        id: 'booking-001',
        client_id: 'client-001-marie-claude',
        barber_id: 'barber-001-marco',
        salon_id: 'salon-001-tony',
        service_type: 'Coupe + Barbe',
        scheduled_time: new Date('2024-01-23T17:30:00'),
        estimated_duration: 45,
        price: 55.00,
        final_price: 55.00,
        ai_metadata: {
          confidence_score: 0.95,
          conversation_summary: 'Cliente régulière, RDV habituel mardi 17h30',
          client_mood: 'neutral',
          special_requests: [],
          predicted_duration: 45,
          upsell_opportunities: ['gel_premium', 'after_shave']
        },
        status: 'confirmed',
        optimization_score: 9.2,
        created_by_ai: true,
        modifications: []
      }
    ],
    barber_performance: [
      {
        barber_id: 'Marco Tremblay',
        clients_served: 8,
        revenue_generated: 520.00,
        efficiency_score: 9.2,
        client_satisfaction: 9.5,
        coaching_alerts: []
      },
      {
        barber_id: 'Jessica Dubois',
        clients_served: 6,
        revenue_generated: 285.00,
        efficiency_score: 7.1,
        client_satisfaction: 8.3,
        coaching_alerts: ['Suggérer produits capillaires', 'Améliorer temps de service']
      },
      {
        barber_id: 'Dimitri Kostas',
        clients_served: 7,
        revenue_generated: 385.00,
        efficiency_score: 8.6,
        client_satisfaction: 8.9,
        coaching_alerts: []
      }
    ],
    ai_insights: [
      {
        type: 'opportunity',
        title: 'Augmentation demande jeudi soir',
        description: 'Demande +35% pour créneaux 18h-20h jeudi. Considérer tarification dynamique.',
        impact_score: 8,
        action_required: true,
        suggested_actions: [
          'Activer pricing dynamique +15% jeudi 18h-20h',
          'Proposer créneaux alternatifs à prix normal',
          'Ajouter barbier supplémentaire si possible'
        ]
      },
      {
        type: 'warning',
        title: 'Jessica: Confiance en baisse',
        description: 'Jessica hésite sur les prix des services additionnels. 3 opportunités upsell manquées.',
        impact_score: 6,
        action_required: true,
        suggested_actions: [
          'Session coaching pricing confidence',
          'Script suggestions automatiques via IA',
          'Shadowing avec Marco jeudi'
        ]
      },
      {
        type: 'trend',
        title: 'Clients premium en hausse',
        description: 'Demande services 60$+ augmente de 22% ce mois. Marco surchargé.',
        impact_score: 9,
        action_required: false,
        suggested_actions: [
          'Former Dimitri aux services premium',
          'Créer liste d\'attente premium',
          'Augmenter tarifs services haut de gamme'
        ]
      }
    ],
    recent_conflicts: [
      {
        id: 'conflict-001',
        salon_id: 'salon-001-tony',
        type: 'staff_tension',
        severity: 'medium',
        parties_involved: ['barber-002-jessica', 'client-002-roger'],
        ai_analysis: 'Roger mécontent du temps d\'attente. Jessica stressée. Tension détectée via analyse vocale.',
        suggested_resolution: 'Offrir compensation (10% rabais) + réassigner Roger vers Dimitri',
        status: 'resolving',
        timestamp: new Date('2024-01-22T14:30:00')
      }
    ],
    surveillance_alerts: [
      {
        id: 'surveillance-001',
        salon_id: 'salon-001-tony',
        timestamp: new Date('2024-01-22T16:45:00'),
        event_type: 'extended_break',
        confidence: 0.78,
        description: 'Jessica en pause depuis 25 minutes (limite: 15min)',
        evidence: ['timestamp_data', 'location_tracking'],
        requires_attention: false,
        owner_notified: false,
        metadata: {
          break_duration: 25,
          scheduled_break: 15,
          reason: 'personal_call'
        }
      }
    ]
  }
};

// 🎯 MÉTRIQUES DE SUCCÈS PROTOTYPE
export const mockPrototypeMetrics = {
  salons_pilotes: 3,
  jours_test: 30,
  total_appels: 1247,
  taux_conversion: 84.2,
  satisfaction_moyenne: 8.6,
  revenus_generes: 15420.00,
  economies_temps: 180, // heures/mois
  cout_operationnel: 90.00, // 30$/salon
  profit_net: 207.00, // 69$/salon * 3
  roi_mensuel: 230.0 // %
};