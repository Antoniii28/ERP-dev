import type { NextFunction, Response } from 'express';
import { isValidObjectId } from 'mongoose';

import type { AuthRequest } from '../middlewares/auth.js';
import { ValidationError } from '../middlewares/errorHandler.js';
import { RoleModel } from '../models/Role.js';
import { writeAudit } from '../services/auditService.js';

export const listRoles = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const roles = await RoleModel.find({ isActive: true, ...(req.auth?.companyId ? { $or: [{ companyId: req.auth.companyId }, { companyId: null }] } : {}) }).lean();
    res.json({ success: true, data: roles, message: 'Roles obtenidos' });
  } catch (e) { next(e); }
};

export const createRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description = '', permissions = [] } = req.body;
    const companyId = req.auth?.companyId ?? null;
    if (await RoleModel.exists({ name, companyId })) throw new ValidationError('El rol ya existe');
    const role = await RoleModel.create({ name, description, permissions, companyId });
    await writeAudit({actorId:req.auth!.userId,companyId:req.auth?.companyId,action:'role.create',entityType:'Role',entityId:role._id,metadata:{name:role.name}}); res.status(201).json({ success: true, data: role, message: 'Rol creado' });
  } catch (e) { next(e); }
};

export const updateRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!isValidObjectId(req.params.id)) throw new ValidationError('Rol no válido');
    const updates: Record<string, unknown> = {};
    for (const key of ['name', 'description', 'permissions', 'isActive'] as const) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const companyId = req.auth?.companyId ?? null;
    if (req.body.name !== undefined && await RoleModel.exists({ name: req.body.name, companyId, _id: { $ne: req.params.id } })) {
      throw new ValidationError('El rol ya existe');
    }
    const role = await RoleModel.findOneAndUpdate({ _id: req.params.id, companyId }, updates, { new: true }).lean();
    if (!role) throw new ValidationError('El rol no existe');
    await writeAudit({actorId:req.auth!.userId,companyId:req.auth?.companyId,action:'role.update',entityType:'Role',entityId:String(req.params.id),metadata:{fields:Object.keys(updates)}}); res.json({ success: true, data: role, message: 'Rol actualizado' });
  } catch (e) { next(e); }
};
