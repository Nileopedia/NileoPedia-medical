import { create } from 'zustand';
import { User, Query, AIResponse, Activity } from '../types';

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
  initialize: () => void;
  setUser: (user: User | null) => void;
  setOtpState: (state: OtpState) => void;
  toggleSidebar: () => void;
  toggleMobileNav: () => void;
  addQuery: (query: Query) => void;
  addResponse: (response: AIResponse) => void;
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
}));