import { Router } from 'express';
import { z } from 'zod';

import { createUser, listUsers, updateUser } from '../controllers/userController.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';
import { ValidationError } from '../middlewares/errorHandler.js';

export const usersRouter = Router();

const validate = (schema: z.ZodType) => (req: import('express').Request, _res: import('express').Response, next: import('express').NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return next(new ValidationError(result.error.issues[0]?.message ?? 'Datos inválidos'));
  req.body = result.data;
  next();
};

const createSchema = z.object({
  username: z.string().min(2).max(80),
  email: z.email(),
  password: z.string().min(8).max(128),
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
  roleIds: z.array(z.string()).default([]),
});
const updateSchema = createSchema.partial().extend({ isActive: z.boolean().optional() });

usersRouter.get('/', authenticate, requirePermission('users.read'), listUsers);
usersRouter.post('/', authenticate, requirePermission('users.create'), validate(createSchema), createUser);
usersRouter.patch('/:id', authenticate, requirePermission('users.update'), validate(updateSchema), updateUser);
