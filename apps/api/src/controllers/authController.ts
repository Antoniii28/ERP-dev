import type { NextFunction, Request, Response } from 'express';

import { env } from '../config/index.js';
import type { AuthRequest } from '../middlewares/auth.js';
import * as authService from '../services/authService.js';
import { writeAudit } from '../services/auditService.js';

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
  try { const data=await authService.login(req.body.email, req.body.password); setRefreshCookie(res,data.refreshToken); await writeAudit({actorId:data.user.id,companyId:data.user.companyId,action:'auth.login',entityType:'User',entityId:data.user.id}); const {refreshToken:_,...publicData}=data; void _; ok(res,publicData,'Sesión iniciada'); } catch (e) { next(e); }
};
export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try { const token=req.cookies?.['jafora.refresh'] ?? req.body.refreshToken; if (!token) throw new (await import('../middlewares/errorHandler.js')).AuthenticationError('Sesión inválida'); const data=await authService.refresh(token); setRefreshCookie(res,data.refreshToken); const {refreshToken:_,...publicData}=data; void _; ok(res,publicData,'Sesión renovada'); } catch (e) { next(e); }
};
export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { await authService.logout(req.auth!.userId); clearRefreshCookie(res); await writeAudit({actorId:req.auth!.userId,companyId:req.auth?.companyId,action:'auth.logout',entityType:'User',entityId:req.auth!.userId}); ok(res,null,'Sesión cerrada'); } catch (e) { next(e); }
};
export const me = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { ok(res, await authService.getCurrentUser(req.auth!.userId), 'Usuario actual'); } catch (e) { next(e); }
};
