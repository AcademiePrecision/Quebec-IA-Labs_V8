import { create } from 'zustand';
import { Formation, Atelier, Badge, UserBadge, Notification, Enrollment } from '../types';

interface AppState {
  formations: Formation[];
  ateliers: Atelier[];
  badges: Badge[];
  userBadges: UserBadge[];
  notifications: Notification[];
  enrollments: Enrollment[];
  
  // Loading states
  isLoadingFormations: boolean;
  isLoadingAteliers: boolean;
  
  // Actions
  setFormations: (formations: Formation[]) => void;
  addFormation: (formation: Formation) => void;
  updateFormation: (id: string, formation: Partial<Formation>) => void;
  
  setAteliers: (ateliers: Atelier[]) => void;
  addAtelier: (atelier: Atelier) => void;
  
  setBadges: (badges: Badge[]) => void;
  setUserBadges: (userBadges: UserBadge[]) => void;
  addUserBadge: (badge: UserBadge) => void;
  
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  
  setEnrollments: (enrollments: Enrollment[]) => void;
  addEnrollment: (enrollment: Enrollment) => void;
  updateEnrollmentProgress: (id: string, progress: number, completedModules: string[]) => void;
  
  setLoadingFormations: (loading: boolean) => void;
  setLoadingAteliers: (loading: boolean) => void;
  
  // Clear all app data
  clearAllData: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  formations: [],
  ateliers: [],
  badges: [],
  userBadges: [],
  notifications: [],
  enrollments: [],
  
  isLoadingFormations: false,
  isLoadingAteliers: false,
  
  setFormations: (formations) => set({ formations }),
  
  addFormation: (formation) => set((state) => ({
    formations: [...state.formations, formation]
  })),
  
  updateFormation: (id, updatedFormation) => set((state) => ({
    formations: state.formations.map(f => 
      f.id === id ? { ...f, ...updatedFormation } : f
    )
  })),
  
  setAteliers: (ateliers) => set({ ateliers }),
  
  addAtelier: (atelier) => set((state) => ({
    ateliers: [...state.ateliers, atelier]
  })),
  
  setBadges: (badges) => set({ badges }),
  
  setUserBadges: (userBadges) => set({ userBadges }),
  
  addUserBadge: (badge) => set((state) => ({
    userBadges: [...state.userBadges, badge]
  })),
  
  setNotifications: (notifications) => set({ notifications }),
  
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, notification]
  })),
  
  markNotificationAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    )
  })),
  
  setEnrollments: (enrollments) => set({ enrollments }),
  
  addEnrollment: (enrollment) => set((state) => ({
    enrollments: [...state.enrollments, enrollment]
  })),
  
  updateEnrollmentProgress: (id, progress, completedModules) => set((state) => ({
    enrollments: state.enrollments.map(e =>
      e.id === id ? { ...e, progress, completedModules } : e
    )
  })),
  
  setLoadingFormations: (isLoadingFormations) => set({ isLoadingFormations }),
  
  setLoadingAteliers: (isLoadingAteliers) => set({ isLoadingAteliers }),
  
  clearAllData: () => set({
    formations: [],
    ateliers: [],
    badges: [],
    userBadges: [],
    notifications: [],
    enrollments: [],
    isLoadingFormations: false,
    isLoadingAteliers: false,
  }),
}));