import { sessionStore } from '../services/sessionStore';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ??
  'https://jafora-api.onrender.com/api/v1';

const REQUEST_TIMEOUT_MS = 15000;

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

export type ApiErrorCode =
  | 'offline'
  | 'timeout'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'rate_limited'
  | 'server'
  | 'unknown';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: ApiErrorCode,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let accessToken: string | null = null;
let refreshInFlight: Promise<boolean> | null = null;

const codeForStatus = (status: number): ApiErrorCode => {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 429) return 'rate_limited';
  if (status >= 500) return 'server';
  return 'unknown';
};

const fallbackMessage = (status: number) => {
  if (status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.';
  if (status === 403) return 'No tienes permisos para realizar esta acción.';
  if (status === 404) return 'No se encontró la información solicitada.';
  if (status === 429) return 'Hay demasiadas solicitudes. Intenta nuevamente más tarde.';
  if (status >= 500) return 'JAFORA no está disponible temporalmente. Intenta nuevamente.';
  return 'No fue posible completar la solicitud.';
};

const parse = async <T>(response: Response): Promise<ApiEnvelope<T>> => {
  const body = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !body?.success) {
    throw new ApiError(
      body?.message || fallbackMessage(response.status),
      codeForStatus(response.status),
      response.status,
    );
  }
  return body;
};

const fetchWithTimeout = async (url: string, init: RequestInit = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('La solicitud tardó demasiado. Intenta nuevamente.', 'timeout');
    }
    throw new ApiError('No hay conexión con JAFORA. Revisa tu conexión a Internet.', 'offline');
  } finally {
    clearTimeout(timeout);
  }
};

const saveSession = async (session: SessionResponse) => {
  accessToken = session.accessToken;
  await sessionStore.saveTokens(session.accessToken, session.refreshToken);
};

export const clearSession = async () => {
  accessToken = null;
  await sessionStore.clear();
};

const refreshAccessToken = async (): Promise<boolean> => {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = await sessionStore.getRefreshToken();
    if (!refreshToken) {
      await clearSession();
      return false;
    }

    try {
      const response = await fetchWithTimeout(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-JAFORA-Client': 'mobile' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        await clearSession();
        return false;
      }

      const envelope = await parse<SessionResponse>(response);
      await saveSession(envelope.data);
      return true;
    } catch {
      await clearSession();
      return false;
    }
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
};

const authorizedRequest = async (path: string, init: RequestInit = {}, retry401 = true) => {
  if (!accessToken) accessToken = await sessionStore.getAccessToken();
  if (!accessToken) throw new ApiError('Tu sesión no está disponible.', 'unauthorized', 401);

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);

  const response = await fetchWithTimeout(`${API_URL}${path}`, { ...init, headers });

  if (response.status === 401 && retry401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return authorizedRequest(path, init, false);
    throw new ApiError('Tu sesión expiró. Inicia sesión nuevamente.', 'unauthorized', 401);
  }

  return response;
};

export const login = async (email: string, password: string) => {
  const response = await fetchWithTimeout(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-JAFORA-Client': 'mobile' },
    body: JSON.stringify({ email, password }),
  });
  const envelope = await parse<SessionResponse>(response);
  await saveSession(envelope.data);
  return envelope.data.user;
};

export const restoreSession = async () => {
  accessToken = await sessionStore.getAccessToken();

  if (accessToken) {
    try {
      const me = await authorizedRequest('/auth/me');
      return (await parse<MobileUser>(me)).data;
    } catch (error) {
      if (!(error instanceof ApiError) || error.code !== 'unauthorized') throw error;
    }
  }

  const refreshed = await refreshAccessToken();
  if (!refreshed) return null;

  try {
    const me = await authorizedRequest('/auth/me', {}, false);
    return (await parse<MobileUser>(me)).data;
  } catch {
    await clearSession();
    return null;
  }
};

export const logout = async () => {
  try {
    if (!accessToken) accessToken = await sessionStore.getAccessToken();
    if (accessToken) {
      await authorizedRequest('/auth/logout', { method: 'POST' }, false).catch(() => undefined);
    }
  } finally {
    await clearSession();
  }
};

export const apiGet = async <T>(path: string): Promise<T> => {
  const response = await authorizedRequest(path);
  return (await parse<T>(response)).data;
};

export const getHealthStatus = async <T = unknown>() => {
  const response = await fetchWithTimeout(`${API_URL}/health`);
  return (await parse<T>(response)).data;
};

export const permissionsFor = (user: MobileUser) =>
  new Set(user.roles.flatMap((role) => role.permissions));

export const can = (user: MobileUser, permission: string) => {
  const permissions = permissionsFor(user);
  return permissions.has('*') || permissions.has(permission);
};
