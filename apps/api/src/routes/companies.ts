import { Router } from 'express';
import { z } from 'zod';

import { createCompany, listCompanies, updateCompany } from '../controllers/companyController.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';
import { ValidationError } from '../middlewares/errorHandler.js';

export const companiesRouter = Router();

const validate = (schema: z.ZodType) => (req: import('express').Request, _res: import('express').Response, next: import('express').NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return next(new ValidationError(result.error.issues[0]?.message ?? 'Datos inválidos'));
  req.body = result.data;
  next();
};

const schema = z.object({
  name: z.string().min(2).max(120),
  legalName: z.string().max(160).optional(),
  taxId: z.string().max(30).optional(),
  email: z.union([z.email(), z.literal('')]).optional(),
  phone: z.string().max(30).optional(),
});
const updateSchema = schema.partial().extend({ isActive: z.boolean().optional() });

companiesRouter.get('/', authenticate, requirePermission('companies.read'), listCompanies);
companiesRouter.post('/', authenticate, requirePermission('companies.create'), validate(schema), createCompany);
companiesRouter.patch('/:id', authenticate, requirePermission('companies.update'), validate(updateSchema), updateCompany);
