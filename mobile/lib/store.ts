import { create } from 'zustand';
import { ConnectionRequest, INITIAL_REQUESTS } from './mockData';

type AuthState = {
  phone: string;
  setPhone: (phone: string) => void;
  businessName: string;
  setBusinessName: (name: string) => void;
  industry: string;
  setIndustry: (industry: string) => void;
  isOnboarded: boolean;
  setOnboarded: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  phone: '',
  setPhone: (phone) => set({ phone }),
  businessName: '',
  setBusinessName: (businessName) => set({ businessName }),
  industry: '',
  setIndustry: (industry) => set({ industry }),
  isOnboarded: false,
  setOnboarded: (isOnboarded) => set({ isOnboarded }),
}));

type RequestsState = {
  requests: ConnectionRequest[];
  removeRequest: (id: string) => void;
};

export const useRequestsStore = create<RequestsState>((set) => ({
  requests: INITIAL_REQUESTS,
  removeRequest: (id) =>
    set((state) => ({
      requests: state.requests.filter((r) => r.id !== id),
    })),
}));

type ToastState = {
  message: string | null;
  showToast: (message: string) => void;
  hideToast: () => void;
};

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  showToast: (message) => set({ message }),
  hideToast: () => set({ message: null }),
}));
