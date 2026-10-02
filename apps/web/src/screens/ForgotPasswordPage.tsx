import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { BrandLogo } from '../components/BrandLogo';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setMessage(''); setSubmitting(true);
    try {
      const response = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const body = await response.json().catch(() => ({ message: 'Respuesta inválida del servidor' }));
      if (!response.ok) throw new Error(body.message ?? 'No fue posible procesar la solicitud');
      setMessage(body.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No fue posible procesar la solicitud');
    } finally { setSubmitting(false); }
  };

  return (
    <main className="login-page">
      <section className="login-hero">
        <BrandLogo />
        <div className="login-hero__copy">
          <span className="eyebrow">Recuperación segura</span>
          <h1>Recupera el acceso a JAFORA.</h1>
          <p>Te enviaremos un enlace temporal para establecer una nueva contraseña.</p>
        </div>
        <small>JAFORA ERP · Tecnología, precisión y confianza.</small>
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <BrandLogo />
          <div><span className="eyebrow">Recuperar acceso</span><h2>Olvidé mi contraseña</h2><p>Escribe el correo asociado a tu cuenta.</p></div>
          <label>Correo electrónico<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@empresa.com" autoComplete="email" required /></label>
          {message && <div className="form-success" role="status">{message}</div>}
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="primary-button" disabled={submitting}>{submitting ? 'Enviando…' : 'Enviar enlace de recuperación'}</button>
          <div><Link to="/login">Volver a iniciar sesión</Link></div>
        </form>
      </section>
    </main>
  );
};
