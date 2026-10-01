import type { NextFunction, Response } from 'express';

import { scopedCompanyId, type AuthRequest } from '../middlewares/auth.js';
import { AuthorizationError } from '../middlewares/errorHandler.js';
import { writeAudit } from '../services/auditService.js';
import * as companies from '../services/companyService.js';

export const listCompanies = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json({ success: true, data: req.auth?.companyId ? [await companies.getCompany(req.auth.companyId)] : await companies.listCompanies(), message: 'Empresas obtenidas' }); }
  catch (e) { next(e); }
};

export const createCompany = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { if(req.auth?.companyId) throw new AuthorizationError('Solo un administrador de plataforma puede crear empresas'); const item=await companies.createCompany(req.body); await writeAudit({actorId:req.auth!.userId,action:'company.create',entityType:'Company',entityId:item._id,metadata:{name:item.name}}); res.status(201).json({ success: true, data:item, message: 'Empresa creada' }); }
  catch (e) { next(e); }
};

export const updateCompany = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { const id=scopedCompanyId(req,String(req.params.id)); if(!id) throw new AuthorizationError(); const item=await companies.updateCompany(id, req.body); await writeAudit({actorId:req.auth!.userId,companyId:id,action:'company.update',entityType:'Company',entityId:id,metadata:{fields:Object.keys(req.body)}}); res.json({ success: true, data:item, message: 'Empresa actualizada' }); }
  catch (e) { next(e); }
};
