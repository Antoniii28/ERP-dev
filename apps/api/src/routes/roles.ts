import { Router } from 'express';
import { z } from 'zod';

import { createRole, listRoles, updateRole } from '../controllers/roleController.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';
import { ValidationError } from '../middlewares/errorHandler.js';

export const rolesRouter = Router();

const validate = (schema: z.ZodType) => (req: import('express').Request, _res: import('express').Response, next: import('express').NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return next(new ValidationError(result.error.issues[0]?.message ?? 'Datos inválidos'));
  req.body = result.data;
  next();
};

const createSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(240).optional(),
  permissions: z.array(z.string().min(1).max(120)).default([]),
});
const updateSchema = createSchema.partial().extend({ isActive: z.boolean().optional() });

rolesRouter.get('/', authenticate, requirePermission('roles.read'), listRoles);
rolesRouter.post('/', authenticate, requirePermission('roles.create'), validate(createSchema), createRole);
rolesRouter.patch('/:id', authenticate, requirePermission('roles.update'), validate(updateSchema), updateRole);
