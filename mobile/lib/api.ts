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
function normalizeMember(value: any): Member {
  return { ...value, name: value.name || [value.firstName, value.lastName].filter(Boolean).join(' '), company_name: value.companyName || value.businessName || value.company_name || null, verification_status: value.verificationStatus || value.verification_status, verification_type: value.verificationType || value.verification_type };
}
function normalizeRequest(value: any): RequestItem {
  return { ...normalizeMember(value.user || {}), request_id: value.id, status: value.status } as RequestItem;
}
function normalizeConversation(value: any): Conversation {
  return { other_id: value.peerUserId, other_name: value.peerName, other_industry: value.peerCompanyName, last_message: value.lastMessage, last_message_at: value.lastMessageAt, unread_count: value.unreadCount };
}
function normalizeMessage(value: any): ChatMessage {
  return { ...value, sender_id: value.senderId, receiver_id: value.receiverId, created_at: value.createdAt };

}
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
  loginWithFirebasePhone: async (idToken: string) => { const r = await request<{ accessToken: string; refreshToken: string; user: Member }>('/firebase-phone/session', { method: 'POST', body: { idToken }, token: null, retry: false }); return { ...r, user: normalizeMember(r.user) }; },
  login: async (email: string, password: string) => { const r = await request<{ accessToken: string; refreshToken: string; user: Member }>('/auth/login', { method: 'POST', body: { email, password }, token: null, retry: false }); return { ...r, user: normalizeMember(r.user) }; },
  register: (data: Record<string, unknown>) => request<{ message: string }>('/auth/register', { method: 'POST', body: data, token: null }),
  me: async () => ({ user: normalizeMember(await request<Member>('/auth/me')) }),
  updateMe: async (fields: Record<string, unknown>) => ({ user: normalizeMember(await request<Member>('/users/me/profile', { method: 'PATCH', body: fields })) }),
  nearby: async () => ({ users: (await request<Member[]>('/users/discover')).map(normalizeMember) }),
  member: async (id: string) => ({ user: normalizeMember(await request<Member>(`/users/${encodeURIComponent(id)}`)) }),
  connect: (id: string) => request(`/connections/request/${encodeURIComponent(id)}`, { method: 'POST' }),
  received: async () => ({ requests: (await request<any[]>('/connections/requests/received')).map(normalizeRequest) }),
  sent: async () => ({ requests: (await request<any[]>('/connections/requests/sent')).map(normalizeRequest) }),
  accept: (id: string) => request(`/connections/request/${encodeURIComponent(id)}/accept`, { method: 'PUT' }),
  decline: (id: string) => request(`/connections/request/${encodeURIComponent(id)}/decline`, { method: 'PUT' }),
  conversations: async () => ({ conversations: (await request<any[]>('/messages')).map(normalizeConversation) }),
  messages: async (id: string) => ({ messages: (await request<any[]>(`/messages/${encodeURIComponent(id)}`)).map(normalizeMessage) }),
  sendMessage: (id: string, content: string) => request(`/messages/${encodeURIComponent(id)}`, { method: 'POST', body: { content } }),
  block: (id: string) => request(`/users/${encodeURIComponent(id)}/block`, { method: 'POST' }),
  unblock: (id: string) => request(`/users/${encodeURIComponent(id)}/block`, { method: 'DELETE' }),
  blocks: () => request<{ blocked: Member[] }>('/safety/blocks'),
  report: (id: string, reason: string, details?: string) => request(`/users/${encodeURIComponent(id)}/report`, { method: 'POST', body: { reason } }),
  deleteAccount: (password?: string) => request('/auth/me', { method: 'DELETE', body: { password: password || null } }),
  events: () => request<{ events: any[] }>('/events'),
  postEvent: (fields: { title: string; event_date: string; description?: string; location?: string; event_type?: string }) => request('/events', { method: 'POST', body: fields }),
  logout: async () => { const refreshToken = await readKey(REFRESH_KEY); if (refreshToken) await request('/auth/logout', { method: 'POST', body: { refreshToken } }).catch(() => {}); await clearSession(); },
};
