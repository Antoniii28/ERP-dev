import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type User = { id: string; username: string; email: string; firstName?: string; lastName?: string; roles: Array<{ name: string; permissions: string[] }> };
type AuthValue = { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void>; api: <T = unknown>(path: string, init?: RequestInit) => Promise<T> };

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';
const AuthContext = createContext<AuthValue | null>(null);
const getAccess = () => sessionStorage.getItem('jafora.access');
const getRefresh = () => localStorage.getItem('jafora.refresh');

const rawRequest = async (path: string, init: RequestInit = {}) => {
  const response = await fetch(`${API}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...init.headers } });
  const body = await response.json().catch(() => ({ message: 'Respuesta inválida del servidor' }));
  if (!response.ok) {
    const error = new Error(body.message ?? 'Error de comunicación') as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  return body.data;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem('jafora.access');
    localStorage.removeItem('jafora.refresh');
    setUser(null);
  }, []);

  const saveSession = useCallback((data: { user: User; accessToken: string; refreshToken: string }) => {
    sessionStorage.setItem('jafora.access', data.accessToken);
    localStorage.setItem('jafora.refresh', data.refreshToken);
    setUser(data.user);
  }, []);

  const renew = useCallback(async () => {
    const refreshToken = getRefresh();
    if (!refreshToken) throw new Error('Sesión expirada');
    const data = await rawRequest('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) });
    saveSession(data);
    return data.accessToken as string;
  }, [saveSession]);

  const api = useCallback(async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
    const send = (token: string | null) => rawRequest(path, {
      ...init,
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
    });
    try {
      return await send(getAccess()) as T;
    } catch (error) {
      if ((error as Error & { status?: number }).status !== 401 || path === '/auth/refresh') throw error;
      try {
        return await send(await renew()) as T;
      } catch (refreshError) {
        clearSession();
        throw refreshError;
      }
    }
  }, [clearSession, renew]);

  useEffect(() => {
    const restore = async () => {
      try {
        const access = getAccess();
        if (access) {
          try {
            setUser(await rawRequest('/auth/me', { headers: { Authorization: `Bearer ${access}` } }));
            return;
          } catch (error) {
            if ((error as Error & { status?: number }).status !== 401) throw error;
          }
        }
        await renew();
      } catch { clearSession(); }
      finally { setLoading(false); }
    };
    void restore();
  }, [clearSession, renew]);

  const value = useMemo<AuthValue>(() => ({
    user, loading, api,
    login: async (email, password) => saveSession(await rawRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })),
    logout: async () => {
      try { if (getAccess()) await api('/auth/logout', { method: 'POST' }); } catch { /* local logout still applies */ }
      clearSession();
    },
  }), [api, clearSession, loading, saveSession, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return value;
};
