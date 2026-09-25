import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';
import { BrandLogo } from '../components/BrandLogo';

export const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setSubmitting(true);
    try { await login(email, password); navigate('/dashboard', { replace: true }); }
    catch (e) { setError(e instanceof Error ? e.message : 'No fue posible iniciar sesión'); }
    finally { setSubmitting(false); }
  };

  return (
    <main className="login-page">
      <section className="login-hero">
        <BrandLogo />
        <div className="login-hero__copy">
          <span className="eyebrow">Gestión empresarial inteligente</span>
          <h1>Control, claridad y crecimiento en un solo lugar.</h1>
          <p>JAFORA integra tus operaciones con una experiencia moderna, segura y preparada para crecer.</p>
        </div>
        <small>JAFORA ERP · Tecnología, precisión y confianza.</small>
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <BrandLogo />
          <div><span className="eyebrow">Acceso seguro</span><h2>Bienvenido</h2><p>Ingresa con tu cuenta de JAFORA ERP.</p></div>
          <label>Correo electrónico<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@empresa.com" autoComplete="email" required /></label>
          <label>Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" minLength={8} required /></label>
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="primary-button" disabled={submitting}>{submitting ? 'Ingresando…' : 'Ingresar a JAFORA'}</button>
          <p className="login-note">La cuenta inicial se crea una sola vez mediante el endpoint seguro de bootstrap.</p>
        </form>
      </section>
    </main>
  );
};
