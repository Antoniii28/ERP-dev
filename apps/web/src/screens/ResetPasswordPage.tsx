import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { BrandLogo } from '../components/BrandLogo';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

export const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setMessage('');
    if (!token) { setError('El enlace de recuperación no contiene un token válido.'); return; }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    setSubmitting(true);
    try {
      const response = await fetch(`${API}/auth/reset-password`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const body = await response.json().catch(() => ({ message: 'Respuesta inválida del servidor' }));
      if (!response.ok) throw new Error(body.message ?? 'No fue posible actualizar la contraseña');
      setMessage(body.message);
      setPassword(''); setConfirm('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No fue posible actualizar la contraseña');
    } finally { setSubmitting(false); }
  };

  return (
    <main className="login-page">
      <section className="login-hero">
        <BrandLogo />
        <div className="login-hero__copy">
          <span className="eyebrow">Nueva contraseña</span>
          <h1>Protege tu cuenta de JAFORA.</h1>
          <p>Elige una contraseña nueva para volver a ingresar al ERP.</p>
        </div>
        <small>JAFORA ERP · Tecnología, precisión y confianza.</small>
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <BrandLogo />
          <div><span className="eyebrow">Restablecer acceso</span><h2>Nueva contraseña</h2><p>Debe tener al menos 8 caracteres.</p></div>
          <label>Nueva contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={8} maxLength={128} required /></label>
          <label>Confirmar contraseña<input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" minLength={8} maxLength={128} required /></label>
          {message && <div className="form-success" role="status">{message} <Link to="/login">Iniciar sesión</Link></div>}
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="primary-button" disabled={submitting || !token}>{submitting ? 'Actualizando…' : 'Actualizar contraseña'}</button>
          <div><Link to="/login">Volver a iniciar sesión</Link></div>
        </form>
      </section>
    </main>
  );
};
