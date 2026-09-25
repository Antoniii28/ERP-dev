import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';
type Role = { _id: string; name: string; description: string; permissions: string[]; isActive: boolean };
const api = async (path: string, init: RequestInit = {}) => {
  const token = sessionStorage.getItem('jafora.access');
  const response = await fetch(`${API}${path}`, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init.headers } });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message ?? 'No fue posible completar la operación');
  return body.data;
};

export const RolesPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', permissions: '' });
  const load = async () => { try { setError(''); setRoles(await api('/roles')); } catch (e) { setError(e instanceof Error ? e.message : 'Error al cargar roles'); } };
  useEffect(() => { void load(); }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setError('');
      const permissions = form.permissions.split(',').map((value) => value.trim()).filter(Boolean);
      await api('/roles', { method: 'POST', body: JSON.stringify({ name: form.name, description: form.description, permissions }) });
      setForm({ name: '', description: '', permissions: '' }); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error al crear rol'); }
  };

  return <section>
    <div className="page-heading"><div><span className="eyebrow">Fase 1</span><h1>Roles y permisos</h1><p>Define qué operaciones puede realizar cada perfil.</p></div></div>
    {error && <p className="form-error">{error}</p>}
    <div className="admin-grid">
      <form className="info-card admin-form" onSubmit={submit}>
        <h2>Nuevo rol</h2>
        <input placeholder="Nombre del rol" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <textarea placeholder="Permisos separados por coma: users.read, users.create" value={form.permissions} onChange={(e) => setForm({ ...form, permissions: e.target.value })} />
        <button className="primary-button" type="submit">Crear rol</button>
      </form>
      <div className="info-card"><h2>Roles activos</h2><div className="data-list">
        {roles.map((role) => <article key={role._id}><div><strong>{role.name}</strong><span>{role.description || 'Sin descripción'}</span></div><small>{role.permissions.join(', ') || 'Sin permisos'}</small></article>)}
        {!roles.length && <p>No hay roles registrados.</p>}
      </div></div>
    </div>
  </section>;
};
