import { Router } from 'express';
import { z } from 'zod';

import { createBranch, listBranches, updateBranch } from '../controllers/branchController.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';
import { ValidationError } from '../middlewares/errorHandler.js';

export const branchesRouter = Router();

const validate = (schema: z.ZodType) => (req: import('express').Request, _res: import('express').Response, next: import('express').NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return next(new ValidationError(result.error.issues[0]?.message ?? 'Datos inválidos'));
  req.body = result.data;
  next();
};

const schema = z.object({
  companyId: z.string().min(1),
  name: z.string().min(2).max(120),
  code: z.string().min(1).max(20),
  address: z.string().max(240).optional(),
  phone: z.string().max(30).optional(),
});
const updateSchema = schema.partial().extend({ isActive: z.boolean().optional() });

branchesRouter.get('/', authenticate, requirePermission('branches.read'), listBranches);
branchesRouter.post('/', authenticate, requirePermission('branches.create'), validate(schema), createBranch);
branchesRouter.patch('/:id', authenticate, requirePermission('branches.update'), validate(updateSchema), updateBranch);
