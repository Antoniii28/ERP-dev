import type { NextFunction, Response } from 'express';
import { isValidObjectId } from 'mongoose';

import type { AuthRequest } from '../middlewares/auth.js';
import { ValidationError } from '../middlewares/errorHandler.js';
import { RoleModel } from '../models/Role.js';
import { UserModel } from '../models/User.js';
import { hashPassword } from '../utils/security.js';

const publicFields = '-passwordHash -refreshTokenHash';

export const listUsers = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await UserModel.find().populate('roleIds', 'name permissions').select(publicFields).lean();
    res.json({ success: true, data: users, message: 'Usuarios obtenidos' });
  } catch (e) { next(e); }
};

export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, firstName = '', lastName = '', roleIds = [] } = req.body;
    if (roleIds.some((id: string) => !isValidObjectId(id))) throw new ValidationError('Uno o más roles no son válidos');
    if (await UserModel.exists({ email: email.toLowerCase() })) throw new ValidationError('El correo ya está registrado');
    if (roleIds.length && await RoleModel.countDocuments({ _id: { $in: roleIds }, isActive: true }) !== roleIds.length) {
      throw new ValidationError('Uno o más roles no existen o están inactivos');
    }
    const user = await UserModel.create({
      username, email, passwordHash: hashPassword(password), firstName, lastName, roleIds,
    });
    const created = await UserModel.findById(user._id).populate('roleIds', 'name permissions').select(publicFields).lean();
    res.status(201).json({ success: true, data: created, message: 'Usuario creado' });
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
      if (roleIds.length && await RoleModel.countDocuments({ _id: { $in: roleIds }, isActive: true }) !== roleIds.length) {
        throw new ValidationError('Uno o más roles no existen o están inactivos');
      }
      updates.roleIds = roleIds;
    }
    const user = await UserModel.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('roleIds', 'name permissions').select(publicFields).lean();
    if (!user) throw new ValidationError('El usuario no existe');
    res.json({ success: true, data: user, message: 'Usuario actualizado' });
  } catch (e) { next(e); }
};
