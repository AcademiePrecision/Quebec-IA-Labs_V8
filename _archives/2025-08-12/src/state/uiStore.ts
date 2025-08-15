import { create } from 'zustand';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  visible: boolean;
}

interface UIState {
  toast: ToastState;
  isLoading: boolean;
  
  // Actions
  showToast: (message: string, type: ToastState['type']) => void;
  hideToast: () => void;
  setLoading: (loading: boolean) => void;
  clearAll: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  toast: {
    message: '',
    type: 'info',
    visible: false,
  },
  isLoading: false,
  
  showToast: (message, type) => set({
    toast: { message, type, visible: true }
  }),
  
  hideToast: () => set({
    toast: { message: '', type: 'info', visible: false }
  }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  clearAll: () => set({
    toast: { message: '', type: 'info', visible: false },
    isLoading: false,
  }),
}));