import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

type Role = {
  _id: string;
  name: string;
};

type User = {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  roleIds: Role[];
};

type UserForm = {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleIds: string[];
};

type EditForm = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roleIds: string[];
  isActive: boolean;
};

const emptyForm: UserForm = {
  username: '',
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  roleIds: [],
};

const api = async (path: string, init: RequestInit = {}) => {
  const token = sessionStorage.getItem('jafora.access');

  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.message ?? 'No fue posible completar la operación');
  }

  return body.data;
};

export const UsersPage = () => {
    const { user } = useAuth();

  const hasPermission = (permission: string) =>
    user?.roles.some(
      (role) =>
        role.permissions.includes('*') ||
        role.permissions.includes(permission),
    ) ?? false;

  const canCreateUsers = hasPermission('users.create');
  const canUpdateUsers = hasPermission('users.update');
  const canReadRoles = hasPermission('roles.read');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState<UserForm>(emptyForm);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);

  const load = async () => {
  try {
    setError('');

    const usersData = await api('/users');
    setUsers(usersData);

    if (canReadRoles) {
      const rolesData = await api('/roles');
      setRoles(rolesData);
    } else {
      setRoles([]);
    }
  } catch (e) {
    setError(e instanceof Error ? e.message : 'Error al cargar usuarios');
  }
};

  useEffect(() => {
    void load();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setError('');

      await api('/users', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      setForm(emptyForm);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear usuario');
    }
  };

  const startEditing = (user: User) => {
    setError('');
    setEditingId(user._id);

    setEditForm({
      username: user.username,
      email: user.email,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      roleIds: user.roleIds.map((role) => role._id),
      isActive: user.isActive,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEditing = async () => {
    if (!editingId || !editForm) return;

    try {
      setError('');

      await api(`/users/${editingId}`, {
        method: 'PATCH',
        body: JSON.stringify(editForm),
      });

      setEditingId(null);
      setEditForm(null);

      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al actualizar usuario');
    }
  };

  return (
    <section>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Fase 1</span>
          <h1>Usuarios</h1>
          <p>Administra las cuentas y sus roles de acceso.</p>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="admin-grid">
        <form className="info-card admin-form" onSubmit={submit}>
          <h2>Nuevo usuario</h2>

          <input
            placeholder="Nombre de usuario"
            value={form.username}
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
            required
          />

          <input
            placeholder="Nombre"
            value={form.firstName}
            onChange={(e) =>
              setForm({ ...form, firstName: e.target.value })
            }
          />

          <input
            placeholder="Apellidos"
            value={form.lastName}
            onChange={(e) =>
              setForm({ ...form, lastName: e.target.value })
            }
          />

          <input
            type="email"
            placeholder="Correo"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
          />

          <input
            type="password"
            placeholder="Contraseña (mín. 8 caracteres)"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            minLength={8}
            required
          />

          <select
            value={form.roleIds[0] ?? ''}
            onChange={(e) =>
              setForm({
                ...form,
                roleIds: e.target.value ? [e.target.value] : [],
              })
            }
          >
            <option value="">Sin rol</option>

            {roles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.name}
              </option>
            ))}
          </select>

          <button className="primary-button" type="submit">
            Crear usuario
          </button>
        </form>

        <div className="info-card">
          <h2>Usuarios registrados</h2>

          <div className="data-list">
            {users.map((item) => {
              const isEditing = editingId === item._id && editForm;

              return (
                <article key={item._id}>
                  {isEditing ? (
                    <div className="admin-form">
                      <input
                        placeholder="Nombre de usuario"
                        value={editForm.username}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            username: e.target.value,
                          })
                        }
                      />

                      <input
                        placeholder="Nombre"
                        value={editForm.firstName}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            firstName: e.target.value,
                          })
                        }
                      />

                      <input
                        placeholder="Apellidos"
                        value={editForm.lastName}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            lastName: e.target.value,
                          })
                        }
                      />

                      <input
                        type="email"
                        placeholder="Correo"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            email: e.target.value,
                          })
                        }
                      />

                      <select
                        value={editForm.roleIds[0] ?? ''}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            roleIds: e.target.value
                              ? [e.target.value]
                              : [],
                          })
                        }
                      >
                        <option value="">Sin rol</option>

                        {roles.map((role) => (
                          <option key={role._id} value={role._id}>
                            {role.name}
                          </option>
                        ))}
                      </select>

                      <label>
                        <input
                          type="checkbox"
                          checked={editForm.isActive}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              isActive: e.target.checked,
                            })
                          }
                        />
                        Usuario activo
                      </label>

                      <div>
                        <button
                          className="primary-button"
                          type="button"
                          onClick={() => void saveEditing()}
                        >
                          Guardar cambios
                        </button>

                        <button
                          type="button"
                          onClick={cancelEditing}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <strong>
                          {item.firstName || item.username} {item.lastName}
                        </strong>
                        <span>{item.email}</span>
                      </div>

                      <div>
                        <small>
                          {item.roleIds.map((role) => role.name).join(', ') ||
                            'Sin rol'}
                        </small>

                        <b>{item.isActive ? 'Activo' : 'Inactivo'}</b>

                        {canUpdateUsers && (
                          <button
                            type="button"
                            onClick={() => startEditing(item)}
                          >
                            Editar
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </article>
              );
            })}

            {!users.length && <p>No hay usuarios registrados.</p>}
          </div>
        </div>
      </div>
    </section>
  );
};