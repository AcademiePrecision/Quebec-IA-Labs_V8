export interface SalonAnalytics {
  period: 'week' | 'month' | 'quarter' | 'year';
  totalRevenue: number;
  workshopRevenue: number;
  contentRoyalties: number;
  spaceRental: number;
  partnershipBonus: number;
  totalViewingMinutes: number;
  activeStudents: number;
  growth: number;
}

export interface FormateurPerformance {
  id: string;
  name: string;
  photo?: string;
  specialties: string[];
  totalRevenue: number;
  contentCount: number;
  averageRating: number;
  totalViews: number;
  viewingMinutes: number;
  royaltiesEarned: number;
  studentsCount: number;
  monthlyGrowth: number;
  lastActive: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface ContentSubmission {
  id: string;
  title: string;
  description: string;
  formateurId: string;
  formateurName: string;
  category: string;
  level: 'debutant' | 'intermediaire' | 'avance';
  duration: number; // minutes
  thumbnailUrl?: string;
  videoUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision_needed';
  submittedAt: string;
  reviewedAt?: string;
  reviewComments?: string;
  expectedPrice: number;
  estimatedRoyalty: number;
}

export interface ContentPerformance {
  id: string;
  title: string;
  formateurName: string;
  totalViews: number;
  totalMinutes: number;
  averageRating: number;
  revenue: number;
  salonRoyalty: number;
  formateurRoyalty: number;
  enrollments: number;
  completionRate: number;
  lastViewed: string;
}

export interface StudentEngagement {
  id: string;
  name: string;
  email: string;
  totalMinutesWatched: number;
  coursesEnrolled: number;
  coursesCompleted: number;
  averageRating: number;
  lastActivity: string;
  monthlySpending: number;
  favoriteFormateur?: string;
  preferredCategories: string[];
}

export interface RevenueBreakdown {
  source: string;
  amount: number;
  percentage: number;
  growth: number;
  description: string;
}

export interface RoyaltyDistribution {
  contentId: string;
  contentTitle: string;
  formateurId: string;
  formateurName: string;
  totalMinutes: number;
  totalRevenue: number;
  salonShare: number;
  formateurShare: number;
  distributionDate: string;
  period: string;
}

export interface SalonDashboardData {
  analytics: {
    week: SalonAnalytics;
    month: SalonAnalytics;
    quarter: SalonAnalytics;
    year: SalonAnalytics;
  };
  formateurs: FormateurPerformance[];
  pendingContent: ContentSubmission[];
  contentPerformance: ContentPerformance[];
  students: StudentEngagement[];
  revenueBreakdown: RevenueBreakdown[];
  royaltyDistributions: RoyaltyDistribution[];
  totalViewingMinutes: number;
  activeFormateurs: number;
  pendingApprovals: number;
}