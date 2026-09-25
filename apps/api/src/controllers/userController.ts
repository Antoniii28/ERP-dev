import type { NextFunction, Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.js';
import { UserModel } from '../models/User.js';

export const listUsers = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await UserModel.find().populate('roleIds', 'name permissions').select('-passwordHash -refreshTokenHash').lean();
    res.json({ success: true, data: users, message: 'Usuarios obtenidos' });
  } catch (e) { next(e); }
};
