export const LoginPage = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(135deg, #0f172a, #1d4ed8)',
        color: 'white',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          padding: '2rem',
          borderRadius: 16,
          background: 'rgba(15, 23, 42, 0.75)',
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.35)',
        }}
      >
        <h1 style={{ marginBottom: '1rem' }}>Iniciar sesión</h1>
        <p style={{ marginBottom: '2rem', opacity: 0.8 }}>ERP · Acceso seguro</p>
        <button
          type="button"
          style={{
            width: '100%',
            padding: '0.85rem 1rem',
            borderRadius: 10,
            border: 'none',
            background: '#60a5fa',
            color: '#0f172a',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Entrar al dashboard
        </button>
      </div>
    </div>
  );
};
