import { AdminDashboardData, RevenueAnalytics, PlatformStats, PartnerSalon, FormateurApplication, ContentSubmission, ActivityFeedItem } from '../types/admin';

const generateRevenueAnalytics = (period: 'week' | 'month' | 'quarter' | 'year'): RevenueAnalytics => {
  const multiplier = period === 'week' ? 1 : period === 'month' ? 4 : period === 'quarter' ? 12 : 48;
  
  return {
    period,
    totalRevenue: 12500 * multiplier + Math.random() * 5000,
    profitMargin: 25 + Math.random() * 15,
    workshopRevenue: 8000 * multiplier + Math.random() * 3000,
    subscriptionRevenue: 3500 * multiplier + Math.random() * 1500,
    partnershipRevenue: 1000 * multiplier + Math.random() * 500,
    growth: (Math.random() - 0.5) * 30, // -15% to +15%
  };
};

const mockPlatformStats: PlatformStats = {
  totalUsers: 2847,
  activeUsers: 1923,
  newUsersThisWeek: 47,
  totalPartners: 23,
  totalFormateurs: 156,
  totalFormations: 89,
  totalAteliers: 234,
  completionRate: 78.5,
};

const mockPartnerSalons: PartnerSalon[] = [
  {
    id: '1',
    name: 'Salon Elite Montréal',
    address: '123 Rue Sainte-Catherine, Montréal',
    partnerAccountId: 'partner1',
    siteCount: 3,
    formateurCount: 8,
    monthlyRevenue: 15600,
    status: 'pending',
    createdAt: '2024-12-01T10:00:00Z',
  },
  {
    id: '2',
    name: 'Barbershop Tradition',
    address: '456 Avenue du Parc, Québec',
    partnerAccountId: 'partner2',
    siteCount: 1,
    formateurCount: 3,
    monthlyRevenue: 8900,
    status: 'active',
    approvedAt: '2024-11-15T14:30:00Z',
    createdAt: '2024-11-10T09:00:00Z',
  },
];

const mockFormateurApplications: FormateurApplication[] = [
  {
    id: '1',
    accountId: 'formateur1',
    name: 'Alexandre Dubois',
    email: 'alexandre.dubois@email.com',
    specialties: ['Barbier', 'Coupe moderne'],
    yearsExperience: 8,
    status: 'pending',
    submittedAt: '2024-12-05T16:45:00Z',
  },
  {
    id: '2',  
    accountId: 'formateur2',
    name: 'Marie-Claire Tremblay',
    email: 'mc.tremblay@email.com',
    specialties: ['Coiffure créative', 'Coloration'],
    yearsExperience: 12,
    status: 'pending',
    submittedAt: '2024-12-03T11:20:00Z',
  },
];

const mockContentSubmissions: ContentSubmission[] = [
  {
    id: '1',
    formateurId: 'formateur3',
    formateurName: 'Marc Leblanc',
    title: 'Techniques avancées de dégradé',
    description: 'Formation complète sur les techniques de dégradé modernes',
    category: 'barbier',
    level: 'avance',
    status: 'pending',
    submittedAt: '2024-12-06T09:15:00Z',
  },
  {
    id: '2',
    formateurId: 'formateur4',
    formateurName: 'Sophie Martin',
    title: 'Introduction à la coloration',
    description: 'Les bases de la coloration pour débutants',
    category: 'coiffure',
    level: 'debutant',
    status: 'revision_needed',
    submittedAt: '2024-12-04T14:30:00Z',
    reviewedAt: '2024-12-05T10:15:00Z',
    reviewComments: 'Veuillez ajouter plus de détails sur les précautions de sécurité',
  },
];

const mockActivityFeed: ActivityFeedItem[] = [
  {
    id: '1',
    type: 'user_registration',
    title: 'Nouvel utilisateur inscrit',
    description: 'Jean Dupont s\'est inscrit comme Académicien/Barbier',
    userId: 'user123',
    userName: 'Jean Dupont',
    timestamp: '2024-12-07T15:30:00Z',
    priority: 'low',
  },
  {
    id: '2',
    type: 'partner_approval',
    title: 'Nouvelle demande de partenariat',
    description: 'Salon Elite Montréal demande l\'approbation comme partenaire',
    timestamp: '2024-12-07T14:15:00Z',
    priority: 'high',
    status: 'pending',
  },
  {
    id: '3',
    type: 'content_submission',
    title: 'Nouveau contenu soumis',
    description: 'Marc Leblanc a soumis "Techniques avancées de dégradé"',
    userId: 'formateur3',
    userName: 'Marc Leblanc',
    timestamp: '2024-12-07T13:45:00Z',
    priority: 'medium',
  },
  {
    id: '4',
    type: 'workshop_booking',
    title: 'Réservation d\'atelier',
    description: '5 nouvelles réservations pour l\'atelier "Coupe moderne"',
    timestamp: '2024-12-07T12:20:00Z',
    priority: 'low',
  },
  {
    id: '5',
    type: 'payment_processed',
    title: 'Paiement traité',
    description: 'Paiement de 149$ traité pour la formation "Techniques de barbe"',
    timestamp: '2024-12-07T11:30:00Z',
    priority: 'low',
  },
];

export const mockAdminDashboardData: AdminDashboardData = {
  revenueAnalytics: {
    week: generateRevenueAnalytics('week'),
    month: generateRevenueAnalytics('month'),
    quarter: generateRevenueAnalytics('quarter'),
    year: generateRevenueAnalytics('year'),
  },
  platformStats: mockPlatformStats,
  pendingApprovals: {
    partners: mockPartnerSalons.filter(p => p.status === 'pending'),
    formateurs: mockFormateurApplications.filter(f => f.status === 'pending'),
    content: mockContentSubmissions.filter(c => c.status === 'pending'),
  },
  activityFeed: mockActivityFeed,
  topActivities: [
    { type: 'Inscriptions utilisateurs', count: 47, growth: 23.5 },
    { type: 'Réservations ateliers', count: 156, growth: 18.2 },
    { type: 'Soumissions contenu', count: 12, growth: 8.7 },
    { type: 'Demandes partenariat', count: 3, growth: -12.5 },
    { type: 'Approbations formateurs', count: 8, growth: 15.3 },
  ],
};