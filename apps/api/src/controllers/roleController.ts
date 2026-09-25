import type { NextFunction, Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.js';
import { RoleModel } from '../models/Role.js';

export const listRoles = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const roles = await RoleModel.find({ isActive: true }).lean();
    res.json({ success: true, data: roles, message: 'Roles obtenidos' });
  } catch (e) { next(e); }
};
