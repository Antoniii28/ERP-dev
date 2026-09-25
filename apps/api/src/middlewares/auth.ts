import type { NextFunction, Request, Response } from 'express';

import { AuthorizationError, AuthenticationError } from './errorHandler.js';
import { UserModel } from '../models/User.js';
import { verifyToken } from '../utils/security.js';

export interface AuthRequest extends Request {
  auth?: { userId: string; permissions: string[] };
}

export const authenticate = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const [scheme, token] = req.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) throw new AuthenticationError();
    const payload = verifyToken(token, 'access');
    const user = await UserModel.findById(payload.sub).populate('roleIds', 'permissions').lean();
    if (!user || !user.isActive) throw new AuthenticationError();
    const roles = user.roleIds as unknown as Array<{ permissions: string[] }>;
    req.auth = { userId: payload.sub, permissions: [...new Set(roles.flatMap((role) => role.permissions))] };
    next();
  } catch (error) { next(error); }
};

export const requirePermission = (permission: string) =>
  (req: AuthRequest, _res: Response, next: NextFunction): void => {
    const permissions = req.auth?.permissions ?? [];
    if (!permissions.includes('*') && !permissions.includes(permission)) return next(new AuthorizationError());
    next();
  };
