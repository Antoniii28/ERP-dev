import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { BrandLogo } from '../components/BrandLogo';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <BrandLogo />
        <nav>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>▦ <span>Panel principal</span></NavLink>
          <div className="nav-item disabled">◫ <span>Clientes</span><em>Próximamente</em></div>
          <div className="nav-item disabled">◇ <span>Inventario</span><em>Próximamente</em></div>
          <div className="nav-item disabled">◎ <span>Ventas</span><em>Próximamente</em></div>
        </nav>
        <div className="sidebar__footer"><span>{user?.email}</span><button onClick={() => void logout()}>Cerrar sesión</button></div>
      </aside>
      <div className="workspace">
        <header className="topbar"><div><span className="eyebrow">JAFORA ERP</span><strong>Panel principal</strong></div><div className="user-chip">{user?.firstName || user?.username}</div></header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
};
