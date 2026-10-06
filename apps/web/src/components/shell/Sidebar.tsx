import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { BrandLogo } from '../BrandLogo';

type Item={to:string;label:string;icon:string;permissions?:string[]};
type Group={label?:string;items:Item[]};
const groups:Group[]=[
  {items:[{to:'/dashboard',label:'Inicio',icon:'⌂'}]},
  {label:'OPERACIÓN',items:[{to:'/commercial',label:'Ventas, compras y finanzas',icon:'↔',permissions:['sales.read','purchases.read','finance.read']},{to:'/operations',label:'Productos e inventario',icon:'▦',permissions:['products.read','inventory.read','customers.read','suppliers.read']}]},
  {label:'ORGANIZACIÓN',items:[{to:'/organizations',label:'Empresas y sucursales',icon:'▣',permissions:['companies.read','branches.read']}]},
  {label:'GESTIÓN',items:[{to:'/crm',label:'CRM',icon:'◇',permissions:['crm.read']},{to:'/reports',label:'Reportes',icon:'▥',permissions:['reports.read']},{to:'/insights',label:'Analítica',icon:'✦',permissions:['reports.read']}]},
  {label:'ADMINISTRACIÓN',items:[{to:'/users',label:'Usuarios',icon:'♙',permissions:['users.read']},{to:'/roles',label:'Roles',icon:'◈',permissions:['roles.read']}]},
];
export const Sidebar=({open,onClose}:{open:boolean;onClose:()=>void})=>{
  const {user,logout}=useAuth();const permissions=new Set(user?.roles.flatMap(r=>r.permissions)??[]);
  const can=(needed?:string[])=>!needed||needed.some(p=>permissions.has('*')||permissions.has(p));
  return <><button className={`sidebar-backdrop ${open?'is-open':''}`} onClick={onClose} aria-label="Cerrar navegación" tabIndex={open?0:-1}/>
  <aside className={`sidebar ${open?'is-open':''}`} aria-label="Navegación principal">
    <div className="sidebar__brand"><BrandLogo/><button className="icon-button sidebar__close" type="button" onClick={onClose} aria-label="Cerrar navegación">×</button></div>
    <nav>{groups.map((group,index)=>{const items=group.items.filter(i=>can(i.permissions));if(!items.length)return null;return <div className="nav-group" key={group.label??index}>{group.label&&<span className="nav-group__label">{group.label}</span>}{items.map(item=><NavLink key={item.to} to={item.to} onClick={onClose} className={({isActive})=>isActive?'nav-item active':'nav-item'}><span className="nav-item__icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span></NavLink>)}</div>})}</nav>
    <div className="sidebar__footer"><span className="sidebar__identity">{user?.email}</span><button type="button" onClick={()=>void logout()}>Cerrar sesión</button></div>
  </aside></>;
};
