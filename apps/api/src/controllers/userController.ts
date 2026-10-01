import type { NextFunction, Response } from 'express';
import { isValidObjectId } from 'mongoose';

import type { AuthRequest } from '../middlewares/auth.js';
import { ValidationError } from '../middlewares/errorHandler.js';
import { RoleModel } from '../models/Role.js';
import { UserModel } from '../models/User.js';
import { hashPassword } from '../utils/security.js';
import { writeAudit } from '../services/auditService.js';

const publicFields = '-passwordHash -refreshTokenHash';

export const listUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await UserModel.find(req.auth?.companyId ? { companyId: req.auth.companyId } : {}).populate('roleIds', 'name permissions').select(publicFields).lean();
    res.json({ success: true, data: users, message: 'Usuarios obtenidos' });
  } catch (e) { next(e); }
};

export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, firstName = '', lastName = '', roleIds = [] } = req.body;
    if (roleIds.some((id: string) => !isValidObjectId(id))) throw new ValidationError('Uno o más roles no son válidos');
    if (await UserModel.exists({ email: email.toLowerCase() })) throw new ValidationError('El correo ya está registrado');
    const roleScope = req.auth?.companyId ? { $or: [{ companyId: req.auth.companyId }, { companyId: null }] } : {};
    if (roleIds.length && await RoleModel.countDocuments({ _id: { $in: roleIds }, isActive: true, ...roleScope }) !== roleIds.length) {
      throw new ValidationError('Uno o más roles no existen o están inactivos');
    }
    const user = await UserModel.create({
      username, email, passwordHash: hashPassword(password), firstName, lastName, roleIds, companyId: req.auth?.companyId ?? null,
    });
    const created = await UserModel.findById(user._id).populate('roleIds', 'name permissions').select(publicFields).lean();
    await writeAudit({actorId:req.auth!.userId,companyId:req.auth?.companyId,action:'user.create',entityType:'User',entityId:user._id,metadata:{email:user.email}}); res.status(201).json({ success: true, data: created, message: 'Usuario creado' });
  } catch (e) { next(e); }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!isValidObjectId(req.params.id)) throw new ValidationError('Usuario no válido');
    const updates: Record<string, unknown> = {};
    for (const key of ['username', 'firstName', 'lastName', 'isActive'] as const) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (req.body.email !== undefined) {
      const email = req.body.email.toLowerCase();
      if (await UserModel.exists({ email, _id: { $ne: req.params.id } })) throw new ValidationError('El correo ya está registrado');
      updates.email = email;
    }
    if (req.body.password !== undefined) updates.passwordHash = hashPassword(req.body.password);
    if (req.body.roleIds !== undefined) {
      const roleIds = req.body.roleIds as string[];
      if (roleIds.some((id) => !isValidObjectId(id))) throw new ValidationError('Uno o más roles no son válidos');
      const roleScope = req.auth?.companyId ? { $or: [{ companyId: req.auth.companyId }, { companyId: null }] } : {};
      if (roleIds.length && await RoleModel.countDocuments({ _id: { $in: roleIds }, isActive: true, ...roleScope }) !== roleIds.length) {
        throw new ValidationError('Uno o más roles no existen o están inactivos');
      }
      updates.roleIds = roleIds;
    }
    const user = await UserModel.findOneAndUpdate({ _id: req.params.id, ...(req.auth?.companyId ? { companyId: req.auth.companyId } : {}) }, updates, { new: true })
      .populate('roleIds', 'name permissions').select(publicFields).lean();
    if (!user) throw new ValidationError('El usuario no existe');
    await writeAudit({actorId:req.auth!.userId,companyId:req.auth?.companyId,action:'user.update',entityType:'User',entityId:String(req.params.id),metadata:{fields:Object.keys(updates)}}); res.json({ success: true, data: user, message: 'Usuario actualizado' });
  } catch (e) { next(e); }
};
