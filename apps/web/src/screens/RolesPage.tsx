import { useAuth } from '../auth/AuthContext';
import { useEffect, useState } from 'react';

type Role = { _id: string; name: string; description: string; permissions: string[]; isActive: boolean };
type RoleEdit = { name: string; description: string; permissions: string; isActive: boolean };

export const RolesPage = () => {
  const { user, api } = useAuth();
  const permissions = new Set(user?.roles.flatMap((role) => role.permissions) ?? []);
  const canUpdate = permissions.has('*') || permissions.has('roles.update');
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', permissions: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState<RoleEdit | null>(null);
  const load = async () => { try { setError(''); setRoles(await api<Role[]>('/roles')); } catch (e) { setError(e instanceof Error ? e.message : 'Error al cargar roles'); } };
  useEffect(() => { void load(); }, [api]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setError('');
      const permissions = form.permissions.split(',').map((value) => value.trim()).filter(Boolean);
      await api('/roles', { method: 'POST', body: JSON.stringify({ name: form.name, description: form.description, permissions }) });
      setForm({ name: '', description: '', permissions: '' }); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error al crear rol'); }
  };
  const startEdit = (role: Role) => { setEditingId(role._id); setEdit({ name: role.name, description: role.description ?? '', permissions: role.permissions.join(', '), isActive: role.isActive }); };
  const saveEdit = async () => {
    if (!editingId || !edit) return;
    try {
      setError('');
      await api(`/roles/${editingId}`, { method: 'PATCH', body: JSON.stringify({ ...edit, permissions: edit.permissions.split(',').map(v => v.trim()).filter(Boolean) }) });
      setEditingId(null); setEdit(null); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error al actualizar rol'); }
  };

  return <section>
    <div className="page-heading"><div><span className="eyebrow">Fase 1</span><h1>Roles y permisos</h1><p>Define qué operaciones puede realizar cada perfil.</p></div></div>
    {error && <p className="form-error">{error}</p>}
    <div className="admin-grid">
      <form className="info-card admin-form" onSubmit={submit}>
        <h2>Nuevo rol</h2>
        <input placeholder="Nombre del rol" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <textarea placeholder="Permisos separados por coma. Ej.: users.read, reports.read" value={form.permissions} onChange={(e) => setForm({ ...form, permissions: e.target.value })} />
        <button className="primary-button" type="submit">Crear rol</button>
      </form>
      <div className="info-card"><h2>Roles</h2><div className="data-list">
        {roles.map((role) => <article key={role._id}>{editingId===role._id&&edit?<div className="admin-form">
          <input value={edit.name} onChange={e=>setEdit({...edit,name:e.target.value})} required/>
          <input value={edit.description} onChange={e=>setEdit({...edit,description:e.target.value})}/>
          <textarea value={edit.permissions} onChange={e=>setEdit({...edit,permissions:e.target.value})}/>
          <label><input type="checkbox" checked={edit.isActive} onChange={e=>setEdit({...edit,isActive:e.target.checked})}/> Rol activo</label>
          <div><button className="primary-button" type="button" onClick={()=>void saveEdit()}>Guardar cambios</button><button type="button" onClick={()=>{setEditingId(null);setEdit(null)}}>Cancelar</button></div>
        </div>:<><div><strong>{role.name}</strong><span>{role.description || 'Sin descripción'}</span><small>{role.permissions.join(', ') || 'Sin permisos'}</small></div><div><b>{role.isActive?'Activo':'Inactivo'}</b>{canUpdate&&<button type="button" onClick={()=>startEdit(role)}>Editar</button>}</div></>}</article>)}
        {!roles.length && <p>No hay roles registrados.</p>}
      </div></div>
    </div>
  </section>;
};
