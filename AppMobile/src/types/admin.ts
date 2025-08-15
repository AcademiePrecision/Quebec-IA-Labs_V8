export interface RevenueAnalytics {
  period: 'week' | 'month' | 'quarter' | 'year';
  totalRevenue: number;
  profitMargin: number;
  workshopRevenue: number;
  subscriptionRevenue: number;
  partnershipRevenue: number;
  growth: number; // percentage change from previous period
}

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
  totalPartners: number;
  totalFormateurs: number;
  totalFormations: number;
  totalAteliers: number;
  completionRate: number;
}

export interface PartnerSalon {
  id: string;
  name: string;
  address: string;
  partnerAccountId: string;
  siteCount: number;
  formateurCount: number;
  monthlyRevenue: number;
  status: 'active' | 'pending' | 'suspended';
  approvedAt?: string;
  createdAt: string;
}

export interface FormateurApplication {
  id: string;
  accountId: string;
  name: string;
  email: string;
  specialties: string[];
  yearsExperience: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface ContentSubmission {
  id: string;
  formateurId: string;
  formateurName: string;
  title: string;
  description: string;
  category: string;
  level: 'debutant' | 'intermediaire' | 'avance';
  videoUrl?: string;
  thumbnailUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision_needed';
  submittedAt: string;
  reviewedAt?: string;
  reviewComments?: string;
}

export interface ActivityFeedItem {
  id: string;
  type: 'user_registration' | 'partner_approval' | 'content_submission' | 'workshop_booking' | 'payment_processed' | 'formateur_application';
  title: string;
  description: string;
  userId?: string;
  userName?: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
  status?: string;
}

export interface CalendarSlot {
  id: string;
  formateurId: string;
  salonId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
}

export interface AdminDashboardData {
  revenueAnalytics: {
    week: RevenueAnalytics;
    month: RevenueAnalytics;
    quarter: RevenueAnalytics;
    year: RevenueAnalytics;
  };
  platformStats: PlatformStats;
  pendingApprovals: {
    partners: PartnerSalon[];
    formateurs: FormateurApplication[];
    content: ContentSubmission[];
  };
  activityFeed: ActivityFeedItem[];
  topActivities: {
    type: string;
    count: number;
    growth: number;
  }[];
}