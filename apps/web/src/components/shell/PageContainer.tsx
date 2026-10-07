import type { ReactNode } from 'react';

export const PageContainer = ({ children }: { children: ReactNode }) => (
  <main className="page-container" id="main-content">{children}</main>
);
