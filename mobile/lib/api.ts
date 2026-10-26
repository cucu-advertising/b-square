import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type Member = {
  id: string;
  name: string;
  company_name?: string | null;
  industry?: string | null;
  headline?: string | null;
  bio?: string | null;
  city?: string | null;
  distance_km?: number | null;
  verification_status?: string;
  connection_status?: string;
  request_id?: string | null;
  role_title?: string | null;
  phone?: string | null;
  email?: string | null;
  verification_type?: string | null;
};
export type RequestItem = Member & { request_id: string };
export type Conversation = { other_id: string; other_name: string; other_industry?: string; last_message?: string; last_message_at?: string; unread_count?: number };
export type ChatMessage = { id: string; sender_id: string; receiver_id: string; content: string; is_system?: boolean; created_at: string };

const TOKEN_KEY = 'bsquare_access_token';
const REFRESH_KEY = 'bsquare_refresh_token';
const baseURL = (process.env.EXPO_PUBLIC_BSQUARE_API_URL || '').replace(/\/+$/, '');
let webAccess: string | null = null;
let webRefresh: string | null = null;

export function isConfigured() { return /^https?:\/\//.test(baseURL); }
export function getApiURL() { return baseURL; }
async function readKey(key: string) {
  if (Platform.OS === 'web') return key === TOKEN_KEY ? webAccess : webRefresh;
  return SecureStore.getItemAsync(key);
}
async function saveKey(key: string, value: string | null) {
  if (Platform.OS === 'web') {
    if (key === TOKEN_KEY) webAccess = value;
    else webRefresh = value;
    return;
  }
  if (value === null) await SecureStore.deleteItemAsync(key);
  else await SecureStore.setItemAsync(key, value, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
}
export async function storeSession(access: string, refresh: string) {
  await saveKey(TOKEN_KEY, access);
  await saveKey(REFRESH_KEY, refresh);
}
export async function clearSession() {
  await Promise.all([saveKey(TOKEN_KEY, null), saveKey(REFRESH_KEY, null)]);
}
export async function getAccessToken() { return readKey(TOKEN_KEY); }
export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) { super(message); this.name = 'ApiError'; }
}

async function request<T>(path: string, options: { method?: string; body?: unknown; token?: string | null; retry?: boolean } = {}): Promise<T> {
  if (!isConfigured()) throw new ApiError(0, 'The B Square API has not been configured. Set EXPO_PUBLIC_BSQUARE_API_URL.');
  const token = options.token !== undefined ? options.token : await getAccessToken();
  let res: Response;
  try {
    res = await fetch(`${baseURL}/api/v1${path}`, {
      method: options.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch { throw new ApiError(0, 'Cannot reach B Square. Check your internet connection and API address.'); }
  const data: any = await res.json().catch(() => ({}));
  if (res.status === 401 && options.retry !== false && path !== '/auth/refresh' && path !== '/auth/login') {
    const refreshToken = await readKey(REFRESH_KEY);
    if (refreshToken) {
      try {
        const updated = await request<{ accessToken: string; refreshToken: string }>('/auth/refresh', { method: 'POST', body: { refreshToken }, token: null, retry: false });
        await storeSession(updated.accessToken, updated.refreshToken);
        return request<T>(path, { ...options, token: updated.accessToken, retry: false });
      } catch { await clearSession(); }
    }
  }
  if (!res.ok) throw new ApiError(res.status, typeof data.error === 'string' ? data.error : 'Request failed', data.code);
  return data as T;
}
export const api = {
  linkFirebasePhone: (idToken: string) => request<{ linked: boolean }>('/firebase-phone/link', { method: 'POST', body: { idToken }, retry: false }),
  loginWithFirebasePhone: (idToken: string) => request<{ accessToken: string; refreshToken: string; user: Member }>('/firebase-phone/session', { method: 'POST', body: { idToken }, token: null, retry: false }),
  login: (email: string, password: string) => request<{ accessToken: string; refreshToken: string; user: Member }>('/auth/login', { method: 'POST', body: { email, password }, token: null, retry: false }),
  register: (data: Record<string, unknown>) => request<{ message: string }>('/auth/register', { method: 'POST', body: data, token: null }),
  me: async () => ({ user: await request<Member>('/auth/me') }),
  updateMe: (fields: Record<string, unknown>) => request<{ user: Member }>('/auth/me', { method: 'PUT', body: fields }),
  nearby: () => request<{ users: Member[] }>('/users/nearby'),
  member: (id: string) => request<{ user: Member }>(`/users/${encodeURIComponent(id)}`),
  connect: (id: string) => request(`/connections/request/${encodeURIComponent(id)}`, { method: 'POST' }),
  received: () => request<{ requests: RequestItem[] }>('/connections/requests/received'),
  sent: () => request<{ requests: RequestItem[] }>('/connections/requests/sent'),
  accept: (id: string) => request(`/connections/request/${encodeURIComponent(id)}/accept`, { method: 'PUT' }),
  decline: (id: string) => request(`/connections/request/${encodeURIComponent(id)}/decline`, { method: 'PUT' }),
  conversations: () => request<{ conversations: Conversation[] }>('/messages'),
  messages: (id: string) => request<{ messages: ChatMessage[] }>(`/messages/${encodeURIComponent(id)}`),
  sendMessage: (id: string, content: string) => request(`/messages/${encodeURIComponent(id)}`, { method: 'POST', body: { content } }),
  block: (id: string) => request(`/safety/block/${encodeURIComponent(id)}`, { method: 'POST' }),
  unblock: (id: string) => request(`/safety/block/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  blocks: () => request<{ blocked: Member[] }>('/safety/blocks'),
  report: (id: string, reason: string, details?: string) => request(`/safety/report/${encodeURIComponent(id)}`, { method: 'POST', body: { reason, details } }),
  deleteAccount: () => request('/safety/account', { method: 'DELETE', body: { confirmation: 'DELETE' } }),
  events: () => request<{ events: any[] }>('/events'),
  postEvent: (fields: { title: string; event_date: string; description?: string; location?: string; event_type?: string }) => request('/events', { method: 'POST', body: fields }),
  logout: async () => { const refreshToken = await readKey(REFRESH_KEY); if (refreshToken) await request('/auth/logout', { method: 'POST', body: { refreshToken } }).catch(() => {}); await clearSession(); },
};
