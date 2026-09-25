import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';
type Role = { _id: string; name: string };
type User = { _id: string; username: string; email: string; firstName?: string; lastName?: string; isActive: boolean; roleIds: Role[] };

const api = async (path: string, init: RequestInit = {}) => {
  const token = sessionStorage.getItem('jafora.access');
  const response = await fetch(`${API}${path}`, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init.headers } });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message ?? 'No fue posible completar la operación');
  return body.data;
};

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', email: '', password: '', firstName: '', lastName: '', roleIds: [] as string[] });

  const load = async () => {
    try { setError(''); setUsers(await api('/users')); setRoles(await api('/roles')); }
    catch (e) { setError(e instanceof Error ? e.message : 'Error al cargar usuarios'); }
  };
  useEffect(() => { void load(); }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setError('');
      await api('/users', { method: 'POST', body: JSON.stringify(form) });
      setForm({ username: '', email: '', password: '', firstName: '', lastName: '', roleIds: [] });
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error al crear usuario'); }
  };

  return <section>
    <div className="page-heading"><div><span className="eyebrow">Fase 1</span><h1>Usuarios</h1><p>Administra las cuentas y sus roles de acceso.</p></div></div>
    {error && <p className="form-error">{error}</p>}
    <div className="admin-grid">
      <form className="info-card admin-form" onSubmit={submit}>
        <h2>Nuevo usuario</h2>
        <input placeholder="Nombre de usuario" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        <input placeholder="Nombre" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        <input placeholder="Apellidos" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        <input type="email" placeholder="Correo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input type="password" placeholder="Contraseña (mín. 8 caracteres)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={8} required />
        <select value={form.roleIds[0] ?? ''} onChange={(e) => setForm({ ...form, roleIds: e.target.value ? [e.target.value] : [] })}>
          <option value="">Sin rol</option>{roles.map((role) => <option key={role._id} value={role._id}>{role.name}</option>)}
        </select>
        <button className="primary-button" type="submit">Crear usuario</button>
      </form>
      <div className="info-card"><h2>Usuarios registrados</h2><div className="data-list">
        {users.map((item) => <article key={item._id}><div><strong>{item.firstName || item.username} {item.lastName}</strong><span>{item.email}</span></div><div><small>{item.roleIds.map((r) => r.name).join(', ') || 'Sin rol'}</small><b>{item.isActive ? 'Activo' : 'Inactivo'}</b></div></article>)}
        {!users.length && <p>No hay usuarios registrados.</p>}
      </div></div>
    </div>
  </section>;
};
