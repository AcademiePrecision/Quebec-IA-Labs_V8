// 🎯 TYPES PARTAGÉS SAVAGECO
// Types communs entre App Mobile et Marcel AI

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  type: 'student' | 'instructor' | 'salon_owner' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Salon {
  id: string;
  name: string;
  address: string;
  phone: string;
  ownerId: string;
  marcelEnabled: boolean;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  instructorId: string;
  salonId?: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripePaymentIntentId: string;
  courseId?: string;
  createdAt: string;
}

export interface MarcelBooking {
  id: string;
  clientPhone: string;
  clientName: string;
  salonId: string;
  barberId: string;
  date: string;
  time: string;
  services: string[];
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  marcelConversationId?: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}