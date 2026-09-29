import type { NextFunction, Response } from 'express';

import type { AuthRequest } from '../middlewares/auth.js';
import * as companies from '../services/companyService.js';

export const listCompanies = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json({ success: true, data: await companies.listCompanies(), message: 'Empresas obtenidas' }); }
  catch (e) { next(e); }
};

export const createCompany = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.status(201).json({ success: true, data: await companies.createCompany(req.body), message: 'Empresa creada' }); }
  catch (e) { next(e); }
};

export const updateCompany = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json({ success: true, data: await companies.updateCompany(req.params.id, req.body), message: 'Empresa actualizada' }); }
  catch (e) { next(e); }
};
