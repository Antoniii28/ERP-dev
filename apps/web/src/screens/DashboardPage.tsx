export const DashboardPage = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bienvenido al ERP. La infraestructura base está lista.</p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginTop: '2rem',
        }}
      >
        {['Ventas', 'Inventario', 'Finanzas', 'Clientes'].map((item) => (
          <div
            key={item}
            style={{
              background: 'white',
              padding: '1rem',
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};
