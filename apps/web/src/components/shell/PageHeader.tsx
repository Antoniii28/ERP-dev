import type { ReactNode } from 'react';

type Props={eyebrow?:string;title:string;description?:string;actions?:ReactNode};
export const PageHeader=({eyebrow,title,description,actions}:Props)=>(
  <header className="page-header">
    <div>{eyebrow&&<span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description&&<p>{description}</p>}</div>
    {actions&&<div className="page-header__actions">{actions}</div>}
  </header>
);
