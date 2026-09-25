import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-loading">Cargando JAFORA ERP…</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};
