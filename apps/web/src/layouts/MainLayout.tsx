import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { BrandLogo } from '../components/BrandLogo';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const permissions = new Set(user?.roles.flatMap((role) => role.permissions) ?? []);
  const can = (permission: string) => permissions.has('*') || permissions.has(permission);
  const canOrganizations = can('companies.read') || can('branches.read');
  const canOperations = can('customers.read') || can('suppliers.read') || can('products.read') || can('inventory.read');

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <BrandLogo />
        <nav>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>▦ <span>Panel principal</span></NavLink>
          {can('users.read') && <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>♙ <span>Usuarios</span></NavLink>}
          {can('roles.read') && <NavLink to="/roles" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>◈ <span>Roles</span></NavLink>}
          {canOrganizations && <NavLink to="/organizations" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>▣ <span>Empresas</span></NavLink>}
          {canOperations && <NavLink to="/operations" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>◫ <span>Operaciones</span></NavLink>}
          <div className="nav-item disabled">◎ <span>Ventas</span><em>Próximamente</em></div>
        </nav>
        <div className="sidebar__footer"><span>{user?.email}</span><button onClick={() => void logout()}>Cerrar sesión</button></div>
      </aside>
      <div className="workspace">
        <header className="topbar"><div><span className="eyebrow">JAFORA ERP</span><strong>Administración</strong></div><div className="user-chip">{user?.firstName || user?.username}</div></header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
};
