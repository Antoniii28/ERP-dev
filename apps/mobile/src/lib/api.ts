import * as SecureStore from 'expo-secure-store';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ??
  'https://jafora-api.onrender.com/api/v1';

const ACCESS_TOKEN_KEY = 'jafora.access';
const REFRESH_TOKEN_KEY = 'jafora.refresh';

export type MobileUser = {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  companyId?: string;
  isActive: boolean;
  roles: Array<{ name: string; permissions: string[] }>;
};

type SessionResponse = {
  user: MobileUser;
  accessToken: string;
  refreshToken?: string;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message: string;
};

let accessToken: string | null = null;

const parse = async <T>(response: Response): Promise<ApiEnvelope<T>> => {
  const body = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !body?.success) {
    throw new Error(body?.message || 'No fue posible completar la solicitud.');
  }
  return body;
};

const saveSession = async (session: SessionResponse) => {
  accessToken = session.accessToken;
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, session.accessToken);
  if (session.refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, session.refreshToken);
  }
};

export const clearSession = async () => {
  accessToken = null;
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
};

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-JAFORA-Client': 'mobile' },
    body: JSON.stringify({ email, password }),
  });
  const envelope = await parse<SessionResponse>(response);
  await saveSession(envelope.data);
  return envelope.data.user;
};

export const restoreSession = async () => {
  accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  if (accessToken) {
    const me = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (me.ok) return (await parse<MobileUser>(me)).data;
  }

  const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    await clearSession();
    return null;
  }

  const refreshed = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-JAFORA-Client': 'mobile' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!refreshed.ok) {
    await clearSession();
    return null;
  }

  const envelope = await parse<SessionResponse>(refreshed);
  await saveSession(envelope.data);
  return envelope.data.user;
};

export const logout = async () => {
  if (accessToken) {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch(() => undefined);
  }
  await clearSession();
};

export const apiGet = async <T>(path: string): Promise<T> => {
  if (!accessToken) accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  if (!accessToken) throw new Error('Tu sesión no está disponible.');
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return (await parse<T>(response)).data;
};

export const permissionsFor = (user: MobileUser) =>
  new Set(user.roles.flatMap((role) => role.permissions));

export const can = (user: MobileUser, permission: string) => {
  const permissions = permissionsFor(user);
  return permissions.has('*') || permissions.has(permission);
};
