import type { NextFunction, Request, Response } from 'express';

import type { AuthRequest } from '../middlewares/auth.js';
import * as authService from '../services/authService.js';

const ok = (res: Response, data: unknown, message: string, status = 200) => res.status(status).json({ success: true, data, message });

export const bootstrap = async (req: Request, res: Response, next: NextFunction) => {
  try { ok(res, await authService.bootstrapAdmin(req.body), 'Administrador inicial creado', 201); } catch (e) { next(e); }
};
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try { ok(res, await authService.login(req.body.email, req.body.password), 'Sesión iniciada'); } catch (e) { next(e); }
};
export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try { ok(res, await authService.refresh(req.body.refreshToken), 'Sesión renovada'); } catch (e) { next(e); }
};
export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { await authService.logout(req.auth!.userId); ok(res, null, 'Sesión cerrada'); } catch (e) { next(e); }
};
export const me = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { ok(res, await authService.getCurrentUser(req.auth!.userId), 'Usuario actual'); } catch (e) { next(e); }
};
