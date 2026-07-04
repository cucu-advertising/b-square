import { create } from 'zustand';
import { CHATS, ChatPreview, ConnectionRequest, REQUESTS } from './mockData';

type AuthFlowState = {
  phone: string;
  otp: string[];
  businessName: string;
  industry: string | null;
  setPhone: (phone: string) => void;
  setOtp: (otp: string[]) => void;
  setBusinessName: (name: string) => void;
  setIndustry: (industry: string) => void;
};

type RequestsState = {
  requests: ConnectionRequest[];
  accept: (id: string) => void;
  decline: (id: string) => void;
  reset: () => void;
};

type ChatsState = {
  chats: ChatPreview[];
};

type AppState = AuthFlowState & RequestsState & ChatsState;

export const useAppStore = create<AppState>((set, get) => ({
  phone: '',
  otp: ['', '', '', ''],
  businessName: '',
  industry: null,
  setPhone: (phone) => set({ phone }),
  setOtp: (otp) => set({ otp }),
  setBusinessName: (businessName) => set({ businessName }),
  setIndustry: (industry) => set({ industry }),

  requests: REQUESTS,
  accept: (id) => set({ requests: get().requests.filter((r) => r.id !== id) }),
  decline: (id) => set({ requests: get().requests.filter((r) => r.id !== id) }),
  reset: () => set({ requests: REQUESTS }),

  chats: CHATS,
}));
