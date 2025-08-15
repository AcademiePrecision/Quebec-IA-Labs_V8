export type UserType = 'admin' | 'salon_partenaire' | 'maitre_formateur' | 'academicien_barbier';

export type Language = 'fr' | 'en';

export interface BaseAccount {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  preferredLanguage: Language;
  profilePhoto?: string;
  createdAt: string;
  updatedAt: string;
  lastUsedProfile?: UserType;
}

export interface BaseProfile {
  id: string;
  accountId: string;
  userType: UserType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProfile extends BaseProfile {
  userType: 'admin';
  adminAccessCode: string;
  department: string;
}

export interface SalonPartenaireProfile extends BaseProfile {
  userType: 'salon_partenaire';
  salonName: string;
  salonAddress: string;
  businessNumber: string;
  website?: string;
  employeeCount: number;
  yearsExperience: number;
  servicesOffered: string[];
  equipmentAvailable: string[];
  workingHours: string;
}

export interface MaitreFormateurProfile extends BaseProfile {
  userType: 'maitre_formateur';
  specialties: string[];
  yearsExperience: number;
  certifications: string[];
  portfolio: string[];
  attachedSalon?: string;
  hourlyRate: number;
  weeklyAvailability: string;
  professionalBio: string;
}

export interface AcademicienBarbierProfile extends BaseProfile {
  userType: 'academicien_barbier';
  experienceLevel: 'debutant' | 'intermediaire' | 'avance';
  specialtiesOfInterest: string[];
  trainingGoals: string;
  employerSalon?: string;
  monthlyTrainingBudget: number;
}

export type UserProfile = AdminProfile | SalonPartenaireProfile | MaitreFormateurProfile | AcademicienBarbierProfile;

export interface UserSession {
  account: BaseAccount;
  activeProfile: UserProfile;
  availableProfiles: UserProfile[];
}

// Legacy types for backward compatibility
export interface BaseUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  preferredLanguage: Language;
  profilePhoto?: string;
  userType: UserType;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser extends BaseUser {
  userType: 'admin';
  adminAccessCode: string;
  department: string;
}

export interface SalonPartenaireUser extends BaseUser {
  userType: 'salon_partenaire';
  salonName: string;
  salonAddress: string;
  businessNumber: string;
  website?: string;
  employeeCount: number;
  yearsExperience: number;
  servicesOffered: string[];
  equipmentAvailable: string[];
  workingHours: string;
}

export interface MaitreFormateurUser extends BaseUser {
  userType: 'maitre_formateur';
  specialties: string[];
  yearsExperience: number;
  certifications: string[];
  portfolio: string[];
  attachedSalon?: string;
  hourlyRate: number;
  weeklyAvailability: string;
  professionalBio: string;
}

export interface AcademicienBarbierUser extends BaseUser {
  userType: 'academicien_barbier';
  experienceLevel: 'debutant' | 'intermediaire' | 'avance';
  specialtiesOfInterest: string[];
  trainingGoals: string;
  employerSalon?: string;
  monthlyTrainingBudget: number;
}

export type User = AdminUser | SalonPartenaireUser | MaitreFormateurUser | AcademicienBarbierUser;

export interface Formation {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'debutant' | 'intermediaire' | 'avance';
  price: number;
  duration: number; // in hours
  formateurId: string;
  formateur: {
    name: string;
    photo: string;
    rating: number;
  };
  previewVideoUrl?: string;
  thumbnailUrl: string;
  modules: Module[];
  rating: number;
  reviewCount: number;
  enrolledCount: number;
  createdAt: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number; // in minutes
  order: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  formationId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  profileId: string;
  formationId: string;
  progress: number; // 0-100
  completedModules: string[];
  enrolledAt: string;
  completedAt?: string;
}

export interface Atelier {
  id: string;
  title: string;
  description: string;
  formateurId: string;
  salonId: string;
  date: string;
  time: string;
  duration: number; // in hours
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  category: string;
  level: 'debutant' | 'intermediaire' | 'avance';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserBadge {
  badgeId: string;
  profileId: string;
  earnedAt: string;
}

export interface Notification {
  id: string;
  profileId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'video';
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message;
  updatedAt: string;
}

// Export payment types
export * from './payment';