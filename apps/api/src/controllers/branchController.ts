import type { NextFunction, Response } from 'express';

import type { AuthRequest } from '../middlewares/auth.js';
import * as branches from '../services/branchService.js';

export const listBranches = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json({ success: true, data: await branches.listBranches(req.query.companyId as string | undefined), message: 'Sucursales obtenidas' }); }
  catch (e) { next(e); }
};

export const createBranch = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.status(201).json({ success: true, data: await branches.createBranch(req.body), message: 'Sucursal creada' }); }
  catch (e) { next(e); }
};

export const updateBranch = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json({ success: true, data: await branches.updateBranch(String(req.params.id), req.body), message: 'Sucursal actualizada' }); }
  catch (e) { next(e); }
};
