import { create } from 'zustand';
import { api, clearSession, getAccessToken, Member, storeSession } from './api';

type Session = {
  user: Member | null;
  loading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithPhone: (firebaseToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: Member) => void;
};
export const useSession = create<Session>((set) => ({
  user: null, loading: true, error: null,
  hydrate: async () => {
    const token = await getAccessToken();
    if (!token) { set({ user: null, loading: false }); return; }
    try { const { user } = await api.me(); set({ user, loading: false, error: null }); }
    catch { await clearSession(); set({ user: null, loading: false }); }
  },
  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const result = await api.login(email.trim(), password);
      await storeSession(result.accessToken, result.refreshToken);
      set({ user: result.user, loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Unable to sign in' });
      throw e;
    }
  },
  signInWithPhone: async firebaseToken => {
    set({ loading: true, error: null });
    try {
      const result = await api.loginWithFirebasePhone(firebaseToken);
      await storeSession(result.accessToken, result.refreshToken);
      set({ user: result.user, loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Phone login failed' });
      throw e;
    }
  },
  signOut: async () => { await api.logout(); set({ user: null, error: null, loading: false }); },
  updateUser: user => set({ user }),
}));
