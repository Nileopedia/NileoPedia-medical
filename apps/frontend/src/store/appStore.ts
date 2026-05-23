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
  isSidebarOpen: boolean;
  isMobileNavOpen: boolean;
  queries: Query[];
  responses: AIResponse[];
  activities: Activity[];
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
  isSidebarOpen: true,
  isMobileNavOpen: false,
  queries: [],
  responses: [],
  activities: [],
  setUser: (user) => set({ user }),
  setOtpState: (otpState) => set({ otpState }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleMobileNav: () => set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),
  addQuery: (query) => set((state) => ({ queries: [...state.queries, query] })),
  addResponse: (response) => set((state) => ({ responses: [...state.responses, response] })),
}));
