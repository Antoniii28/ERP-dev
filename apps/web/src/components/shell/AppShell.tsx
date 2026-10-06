import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { PageContainer } from './PageContainer';
import { Sidebar } from './Sidebar';

export const AppShell=()=>{const [open,setOpen]=useState(false);return <div className="app-shell"><a className="skip-link" href="#main-content">Saltar al contenido</a><Sidebar open={open} onClose={()=>setOpen(false)}/><div className="workspace"><AppHeader onMenu={()=>setOpen(true)}/><PageContainer><Outlet/></PageContainer></div></div>};
