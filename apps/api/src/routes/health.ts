import { Router } from 'express';
import { getDatabaseStatus } from '../config/database.js';
export const healthRouter = Router();
healthRouter.get('/', (_req,res)=>{const database=getDatabaseStatus();res.status(200).json({success:true,data:{status:'ok',database},message:'API disponible'});});
healthRouter.get('/ready',(_req,res)=>{const database=getDatabaseStatus();const ready=database==='connected';res.status(ready?200:503).json({success:ready,data:{status:ready?'ready':'not_ready',database},message:ready?'API y base de datos disponibles':'Base de datos no disponible'});});
