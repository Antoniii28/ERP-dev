import { Router } from 'express';
import { listUsers } from '../controllers/userController.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';

export const usersRouter = Router();
usersRouter.get('/', authenticate, requirePermission('users.read'), listUsers);
