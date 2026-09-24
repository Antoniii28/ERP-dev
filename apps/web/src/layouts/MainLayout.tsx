import { Outlet } from 'react-router-dom';

export const MainLayout = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', color: '#111827' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 2rem',
          background: '#0f172a',
          color: 'white',
        }}
      >
        <strong>ERP</strong>
        <span>Panel principal</span>
      </header>
      <main style={{ padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  );
};
