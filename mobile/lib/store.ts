import { create } from 'zustand';
import { INITIAL_REQUESTS, type ConnectionRequest } from './mockData';

type AppState = {
  requests: ConnectionRequest[];
  connectedIds: string[];
  sentIds: string[];
  acceptRequest: (id: string) => void;
  declineRequest: (id: string) => void;
  connect: (id: string) => void;
  requestIntro: (id: string) => void;
};

/** In-memory mock state — connect / accept / decline never hit a backend. */
export const useAppStore = create<AppState>((set) => ({
  requests: INITIAL_REQUESTS,
  connectedIds: [],
  sentIds: [],
  acceptRequest: (id) =>
    set((s) => ({
      requests: s.requests.filter((r) => r.id !== id),
      connectedIds: s.connectedIds.includes(id) ? s.connectedIds : [...s.connectedIds, id],
    })),
  declineRequest: (id) =>
    set((s) => ({ requests: s.requests.filter((r) => r.id !== id) })),
  connect: (id) =>
    set((s) => ({ sentIds: s.sentIds.includes(id) ? s.sentIds : [...s.sentIds, id] })),
  requestIntro: (id) =>
    set((s) => ({ sentIds: s.sentIds.includes(id) ? s.sentIds : [...s.sentIds, id] })),
}));

type ToastState = {
  message: string | null;
  show: (message: string) => void;
  hide: () => void;
};

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  show: (message) => set({ message }),
  hide: () => set({ message: null }),
}));
