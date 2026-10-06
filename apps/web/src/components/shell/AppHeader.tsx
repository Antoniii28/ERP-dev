import { useAuth } from '../../auth/AuthContext';

export const AppHeader=({onMenu}: {onMenu:()=>void})=>{
  const {user}=useAuth();
  const name=user?.firstName||user?.username||'Usuario';
  return <header className="app-header">
    <button className="icon-button app-header__menu" type="button" onClick={onMenu} aria-label="Abrir navegación">☰</button>
    <div className="app-header__context"><span className="eyebrow">JAFORA ERP</span><strong>Gestión empresarial</strong></div>
    <div className="user-chip" aria-label={`Sesión de ${name}`}><span className="user-chip__avatar" aria-hidden="true">{name.slice(0,1).toUpperCase()}</span><span>{name}</span></div>
  </header>;
};
