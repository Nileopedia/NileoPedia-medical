import { create } from 'zustand';
import { User, Query, AIResponse, Activity } from '../types';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'document' | 'validation' | 'ai' | 'alert' | 'security' | 'system';
  read: boolean;
  createdAt: string;
}

interface OtpState {
  needsOtp: boolean;
  email: string;
  role: 'validator' | 'admin';
}

interface AppState {
  user: User | null;
  otpState: OtpState;
  isInitialized: boolean;
  isSidebarOpen: boolean;
  isMobileNavOpen: boolean;
  queries: Query[];
  responses: AIResponse[];
  activities: Activity[];
  notifications: Notification[];
  backendAvailable: boolean;
  initialize: () => void;
  setBackendAvailable: (available: boolean) => void;
  setUser: (user: User | null) => void;
  setOtpState: (state: OtpState) => void;
  toggleSidebar: () => void;
  toggleMobileNav: () => void;
  addQuery: (query: Query) => void;
  addResponse: (response: AIResponse) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  otpState: { needsOtp: false, email: '', role: 'validator' },
  isInitialized: false,
  isSidebarOpen: true,
  isMobileNavOpen: false,
  queries: [],
  responses: [],
  activities: [],
  notifications: [],
  backendAvailable: true,
  initialize: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        set({ user: JSON.parse(userData), isInitialized: true });
      } catch {
        set({ isInitialized: true });
      }
    } else {
      set({ isInitialized: true });
    }
  },
  setBackendAvailable: (backendAvailable) => set({ backendAvailable }),
  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    set({ user });
  },
  setOtpState: (otpState) => set({ otpState }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleMobileNav: () => set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),
  addQuery: (query) => set((state) => ({ queries: [...state.queries, query] })),
  addResponse: (response) => set((state) => ({ responses: [...state.responses, response] })),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  clearNotifications: () => set({ notifications: [] }),
}));