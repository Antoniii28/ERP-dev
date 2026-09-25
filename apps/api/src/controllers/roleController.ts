import type { NextFunction, Response } from 'express';
import { isValidObjectId } from 'mongoose';

import type { AuthRequest } from '../middlewares/auth.js';
import { ValidationError } from '../middlewares/errorHandler.js';
import { RoleModel } from '../models/Role.js';

export const listRoles = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const roles = await RoleModel.find({ isActive: true }).lean();
    res.json({ success: true, data: roles, message: 'Roles obtenidos' });
  } catch (e) { next(e); }
};

export const createRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description = '', permissions = [] } = req.body;
    if (await RoleModel.exists({ name, companyId: null })) throw new ValidationError('El rol ya existe');
    const role = await RoleModel.create({ name, description, permissions });
    res.status(201).json({ success: true, data: role, message: 'Rol creado' });
  } catch (e) { next(e); }
};

export const updateRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!isValidObjectId(req.params.id)) throw new ValidationError('Rol no válido');
    const updates: Record<string, unknown> = {};
    for (const key of ['name', 'description', 'permissions', 'isActive'] as const) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (req.body.name !== undefined && await RoleModel.exists({ name: req.body.name, companyId: null, _id: { $ne: req.params.id } })) {
      throw new ValidationError('El rol ya existe');
    }
    const role = await RoleModel.findByIdAndUpdate(req.params.id, updates, { new: true }).lean();
    if (!role) throw new ValidationError('El rol no existe');
    res.json({ success: true, data: role, message: 'Rol actualizado' });
  } catch (e) { next(e); }
};
