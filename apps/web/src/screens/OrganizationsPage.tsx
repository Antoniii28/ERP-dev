import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

type Company = { _id: string; name: string; legalName?: string; taxId?: string; email?: string; phone?: string; isActive: boolean };
type Branch = { _id: string; companyId: Company | string; name: string; code: string; address?: string; phone?: string; isActive: boolean };

const api = async (path: string, init: RequestInit = {}) => {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionStorage.getItem('jafora.access')}`, ...init.headers },
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message ?? 'No fue posible completar la operación');
  return body.data;
};

export const OrganizationsPage = () => {
  const { user } = useAuth();
  const permissions = new Set(user?.roles.flatMap((role) => role.permissions) ?? []);
  const can = (permission: string) => permissions.has('*') || permissions.has(permission);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [error, setError] = useState('');
  const [company, setCompany] = useState({ name: '', legalName: '', taxId: '', email: '', phone: '' });
  const [branch, setBranch] = useState({ companyId: '', name: '', code: '', address: '', phone: '' });

  const load = async () => {
    try {
      setError('');
      const companyData = can('companies.read') ? await api('/companies') : [];
      setCompanies(companyData);
      if (!branch.companyId && companyData[0]?._id) setBranch((current) => ({ ...current, companyId: companyData[0]._id }));
      setBranches(can('branches.read') ? await api('/branches') : []);
    } catch (e) { setError(e instanceof Error ? e.message : 'Error al cargar organizaciones'); }
  };

  useEffect(() => { void load(); }, []);

  const createCompany = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await api('/companies', { method: 'POST', body: JSON.stringify(company) });
      setCompany({ name: '', legalName: '', taxId: '', email: '', phone: '' });
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error al crear empresa'); }
  };

  const createBranch = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await api('/branches', { method: 'POST', body: JSON.stringify(branch) });
      setBranch((current) => ({ companyId: current.companyId, name: '', code: '', address: '', phone: '' }));
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error al crear sucursal'); }
  };

  return (
    <section>
      <div className="page-heading"><div><span className="eyebrow">Fase 2</span><h1>Empresas y sucursales</h1><p>Administra la estructura multiempresa de JAFORA ERP.</p></div></div>
      {error && <p className="form-error">{error}</p>}

      <div className="organization-grid">
        {can('companies.create') && (
          <form className="info-card admin-form" onSubmit={createCompany}>
            <h2>Nueva empresa</h2>
            <input placeholder="Nombre comercial" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} required />
            <input placeholder="Razón social" value={company.legalName} onChange={(e) => setCompany({ ...company, legalName: e.target.value })} />
            <input placeholder="RFC / Identificador fiscal" value={company.taxId} onChange={(e) => setCompany({ ...company, taxId: e.target.value })} />
            <input type="email" placeholder="Correo" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} />
            <input placeholder="Teléfono" value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} />
            <button className="primary-button" type="submit">Crear empresa</button>
          </form>
        )}

        {can('branches.create') && (
          <form className="info-card admin-form" onSubmit={createBranch}>
            <h2>Nueva sucursal</h2>
            <select value={branch.companyId} onChange={(e) => setBranch({ ...branch, companyId: e.target.value })} required>
              <option value="">Selecciona empresa</option>
              {companies.filter((item) => item.isActive).map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
            </select>
            <input placeholder="Nombre de sucursal" value={branch.name} onChange={(e) => setBranch({ ...branch, name: e.target.value })} required />
            <input placeholder="Código" value={branch.code} onChange={(e) => setBranch({ ...branch, code: e.target.value })} required />
            <input placeholder="Dirección" value={branch.address} onChange={(e) => setBranch({ ...branch, address: e.target.value })} />
            <input placeholder="Teléfono" value={branch.phone} onChange={(e) => setBranch({ ...branch, phone: e.target.value })} />
            <button className="primary-button" type="submit">Crear sucursal</button>
          </form>
        )}
      </div>

      <div className="organization-grid">
        {can('companies.read') && <div className="info-card"><h2>Empresas</h2><div className="data-list">{companies.map((item) => <article key={item._id}><div><strong>{item.name}</strong><span>{item.legalName || 'Sin razón social'} · {item.taxId || 'Sin RFC'}</span></div><b>{item.isActive ? 'Activa' : 'Inactiva'}</b></article>)}{!companies.length && <p>No hay empresas registradas.</p>}</div></div>}
        {can('branches.read') && <div className="info-card"><h2>Sucursales</h2><div className="data-list">{branches.map((item) => <article key={item._id}><div><strong>{item.name}</strong><span>{typeof item.companyId === 'string' ? '' : item.companyId.name} · {item.code}</span><small>{item.address || 'Sin dirección'}</small></div><b>{item.isActive ? 'Activa' : 'Inactiva'}</b></article>)}{!branches.length && <p>No hay sucursales registradas.</p>}</div></div>}
      </div>
    </section>
  );
};
