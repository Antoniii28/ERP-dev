import { env } from '../config/index.js';

type PasswordResetEmail = { to: string; name: string; resetUrl: string };

export const sendPasswordResetEmail = async ({ to, name, resetUrl }: PasswordResetEmail) => {
  if (!env.RESEND_API_KEY) {
    if (env.NODE_ENV === 'production') throw new Error('RESEND_API_KEY no está configurada');
    console.info(`Password reset URL for ${to}: ${resetUrl}`);
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [to],
      subject: 'Restablece tu contraseña de JAFORA ERP',
      html: `<!doctype html>
<html lang="es">
  <body style="font-family:Arial,sans-serif;background:#f4f7fb;padding:32px;color:#0d2347">
    <div style="max-width:560px;margin:auto;background:#fff;border-radius:16px;padding:32px">
      <h1 style="margin-top:0">JAFORA ERP</h1>
      <p>Hola ${escapeHtml(name)},</p>
      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
      <p style="margin:28px 0"><a href="${escapeHtml(resetUrl)}" style="background:#0d6efd;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Restablecer contraseña</a></p>
      <p>Este enlace caduca en 30 minutos y solo puede utilizarse una vez.</p>
      <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
    </div>
  </body>
</html>`,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('Resend password reset failed:', response.status, detail);
    throw new Error('No fue posible enviar el correo de recuperación');
  }
};

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
}[char] ?? char));
