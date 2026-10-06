import type { NextFunction, Request, Response } from 'express';

import { env } from '../config/index.js';
import type { AuthRequest } from '../middlewares/auth.js';
import { AuthenticationError } from '../middlewares/errorHandler.js';
import * as authService from '../services/authService.js';
import { writeAudit } from '../services/auditService.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

const ok = (res: Response, data: unknown, message: string, status = 200) => res.status(status).json({ success: true, data, message });
const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
const setRefreshCookie = (res: Response, token: string) => res.cookie('jafora.refresh', token, cookieOptions);
const clearRefreshCookie = (res: Response) => res.clearCookie('jafora.refresh', { ...cookieOptions, maxAge: undefined });

export const bootstrap = async (req: Request, res: Response, next: NextFunction) => {
  try { const data=await authService.bootstrapAdmin(req.body); setRefreshCookie(res,data.refreshToken); const {refreshToken:_,...publicData}=data; void _; ok(res,publicData,'Administrador inicial creado',201); } catch (e) { next(e); }
};
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.login(req.body.email, req.body.password);
    setRefreshCookie(res, data.refreshToken);
    await writeAudit({actorId:data.user.id,companyId:data.user.companyId,action:'auth.login',entityType:'User',entityId:data.user.id});
    const isMobileClient = req.get('X-JAFORA-Client') === 'mobile';
    const publicData = isMobileClient ? data : (({ refreshToken: _, ...rest }) => { void _; return rest; })(data);
    ok(res, publicData, 'Sesión iniciada');
  } catch (e) { next(e); }
};
export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token=req.cookies?.['jafora.refresh'] ?? req.body.refreshToken;
    if (!token) throw new AuthenticationError('Sesión inválida');
    const data=await authService.refresh(token);
    setRefreshCookie(res,data.refreshToken);
    const isMobileClient = req.get('X-JAFORA-Client') === 'mobile';
    const publicData = isMobileClient ? data : (({ refreshToken: _, ...rest }) => { void _; return rest; })(data);
    ok(res, publicData, 'Sesión renovada');
  } catch (e) { next(e); }
};
export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { await authService.logout(req.auth!.userId); clearRefreshCookie(res); await writeAudit({actorId:req.auth!.userId,companyId:req.auth?.companyId,action:'auth.logout',entityType:'User',entityId:req.auth!.userId}); ok(res,null,'Sesión cerrada'); } catch (e) { next(e); }
};
export const me = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { ok(res, await authService.getCurrentUser(req.auth!.userId), 'Usuario actual'); } catch (e) { next(e); }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reset = await authService.createPasswordReset(req.body.email);
    if (reset) {
      const resetUrl = `${env.WEB_URL.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(reset.token)}`;
      try {
        await sendPasswordResetEmail({ to: reset.email, name: reset.name, resetUrl });
        await writeAudit({ actorId: reset.userId, companyId: reset.companyId, action: 'auth.password_reset_requested', entityType: 'User', entityId: reset.userId });
      } catch (error) {
        console.error('Password reset email could not be delivered:', error);
      }
    }
    ok(res, null, 'Si existe una cuenta activa con ese correo, recibirás instrucciones para restablecer tu contraseña');
  } catch (e) { next(e); }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.resetPassword(req.body.token, req.body.password);
    clearRefreshCookie(res);
    await writeAudit({ actorId: result.userId, companyId: result.companyId, action: 'auth.password_reset_completed', entityType: 'User', entityId: result.userId });
    ok(res, null, 'Contraseña actualizada correctamente');
  } catch (e) { next(e); }
};
