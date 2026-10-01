import type { NextFunction, Response } from 'express';

import { scopedCompanyId, type AuthRequest } from '../middlewares/auth.js';
import { writeAudit } from '../services/auditService.js';
import * as branches from '../services/branchService.js';

export const listBranches = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json({ success: true, data: await branches.listBranches(scopedCompanyId(req,req.query.companyId)), message: 'Sucursales obtenidas' }); }
  catch (e) { next(e); }
};

export const createBranch = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { req.body.companyId=scopedCompanyId(req,req.body.companyId); const item=await branches.createBranch(req.body); await writeAudit({actorId:req.auth!.userId,companyId:req.body.companyId,action:'branch.create',entityType:'Branch',entityId:item._id,metadata:{name:item.name,code:item.code}}); res.status(201).json({ success: true, data:item, message: 'Sucursal creada' }); }
  catch (e) { next(e); }
};

export const updateBranch = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { const companyId=scopedCompanyId(req,req.body.companyId); const item=await branches.updateBranch(String(req.params.id), req.body, companyId); await writeAudit({actorId:req.auth!.userId,companyId:companyId??undefined,action:'branch.update',entityType:'Branch',entityId:item._id,metadata:{fields:Object.keys(req.body)}}); res.json({ success: true, data:item, message: 'Sucursal actualizada' }); }
  catch (e) { next(e); }
};
