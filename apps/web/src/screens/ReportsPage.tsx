import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

type Summary={summary:{salesTotal:number;purchaseTotal:number;balance:number};sales:Array<{_id:string;createdAt:string;total:number}>;purchases:Array<{_id:string;createdAt:string;total:number}>};

export const ReportsPage=()=>{
  const {api,download}=useAuth();const [d,setD]=useState<Summary|null>(null),[err,setErr]=useState(''),[exporting,setExporting]=useState(false);
  useEffect(()=>{api<Summary>('/reports/summary').then(setD).catch(e=>setErr(e instanceof Error?e.message:'Error al cargar reportes'))},[api]);
  const exportPdf=async()=>{try{setErr('');setExporting(true);const {blob,filename}=await download('/reports/summary/pdf');const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=filename;document.body.appendChild(anchor);anchor.click();anchor.remove();URL.revokeObjectURL(url)}catch(e){setErr(e instanceof Error?e.message:'No fue posible exportar el PDF')}finally{setExporting(false)}};
  return <section><div className="page-heading"><div><span className="eyebrow">Fase 5</span><h1>Reportes ejecutivos</h1><p>Resumen comercial y financiero basado en los movimientos registrados.</p></div><button className="primary-button" type="button" onClick={()=>void exportPdf()} disabled={exporting}>{exporting?'Exportando…':'Exportar PDF'}</button></div>
  {err&&<p className="form-error">{err}</p>}{d&&<><div className="finance-summary"><article><span>Ventas</span><strong>$ {d.summary.salesTotal.toFixed(2)}</strong></article><article><span>Compras</span><strong>$ {d.summary.purchaseTotal.toFixed(2)}</strong></article><article><span>Balance</span><strong>$ {d.summary.balance.toFixed(2)}</strong></article></div><div className="operations-grid"><div className="info-card"><h2>Ventas recientes</h2><div className="data-list">{d.sales.map(x=><article key={x._id}><span>{new Date(x.createdAt).toLocaleDateString()}</span><b>$ {x.total.toFixed(2)}</b></article>)}</div></div><div className="info-card"><h2>Compras recientes</h2><div className="data-list">{d.purchases.map(x=><article key={x._id}><span>{new Date(x.createdAt).toLocaleDateString()}</span><b>$ {x.total.toFixed(2)}</b></article>)}</div></div></div></>}</section>;
};
