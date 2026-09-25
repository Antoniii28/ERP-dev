import { useAuth } from '../auth/AuthContext';

export const DashboardPage = () => {
  const { user } = useAuth();
  return (
    <section>
      <div className="page-heading"><div><span className="eyebrow">Resumen</span><h1>Hola, {user?.firstName || user?.username}</h1><p>La base segura de JAFORA ERP está lista para conectar los módulos operativos.</p></div><span className="status-pill">● Sistema conectado</span></div>
      <div className="phase-grid">
        <article><span>01</span><strong>Autenticación</strong><p>JWT de acceso y renovación de sesión.</p></article>
        <article><span>02</span><strong>Usuarios</strong><p>Identidad, estado y relación con roles.</p></article>
        <article><span>03</span><strong>Roles y permisos</strong><p>RBAC preparado para permisos granulares.</p></article>
      </div>
      <div className="info-card"><span className="eyebrow">Fase 1</span><h2>Seguridad antes que módulos</h2><p>Clientes, inventario, ventas y finanzas se habilitarán en sus fases correspondientes. Esto evita pantallas ficticias y mantiene la arquitectura verificable.</p></div>
    </section>
  );
};
