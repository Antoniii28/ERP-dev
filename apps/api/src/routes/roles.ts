import { Router } from 'express';
import { listRoles } from '../controllers/roleController.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';

export const rolesRouter = Router();
rolesRouter.get('/', authenticate, requirePermission('roles.read'), listRoles);
