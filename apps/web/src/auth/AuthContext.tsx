import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type User = { id: string; username: string; email: string; firstName?: string; lastName?: string; roles: Array<{ name: string; permissions: string[] }> };
type AuthValue = { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void> };

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';
const AuthContext = createContext<AuthValue | null>(null);
const getAccess = () => sessionStorage.getItem('jafora.access');
const getRefresh = () => localStorage.getItem('jafora.refresh');

const request = async (path: string, init: RequestInit = {}) => {
  const response = await fetch(`${API}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...init.headers } });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message ?? 'Error de comunicación');
  return body.data;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const saveSession = (data: { user: User; accessToken: string; refreshToken: string }) => {
    sessionStorage.setItem('jafora.access', data.accessToken);
    localStorage.setItem('jafora.refresh', data.refreshToken);
    setUser(data.user);
  };

  useEffect(() => {
    const restore = async () => {
      try {
        const access = getAccess();
        if (access) {
          const current = await request('/auth/me', { headers: { Authorization: `Bearer ${access}` } });
          setUser(current); return;
        }
        const refreshToken = getRefresh();
        if (refreshToken) saveSession(await request('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }));
      } catch { sessionStorage.removeItem('jafora.access'); localStorage.removeItem('jafora.refresh'); }
      finally { setLoading(false); }
    };
    void restore();
  }, []);

  const value = useMemo<AuthValue>(() => ({
    user, loading,
    login: async (email, password) => saveSession(await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })),
    logout: async () => {
      const access = getAccess();
      try { if (access) await request('/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${access}` } }); } catch { /* local logout still applies */ }
      sessionStorage.removeItem('jafora.access'); localStorage.removeItem('jafora.refresh'); setUser(null);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return value;
};
