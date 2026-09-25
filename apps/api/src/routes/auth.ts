import { Router } from 'express';
import { z } from 'zod';

import * as controller from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { ValidationError } from '../middlewares/errorHandler.js';

export const authRouter = Router();

const validate = (schema: z.ZodType) => (req: import('express').Request, _res: import('express').Response, next: import('express').NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return next(new ValidationError(result.error.issues[0]?.message ?? 'Datos inválidos'));
  req.body = result.data;
  next();
};

const credentials = z.object({ email: z.email(), password: z.string().min(8).max(128) });
const bootstrap = credentials.extend({
  username: z.string().min(2).max(80),
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
});
const refresh = z.object({ refreshToken: z.string().min(20) });

authRouter.post('/bootstrap', validate(bootstrap), controller.bootstrap);
authRouter.post('/login', validate(credentials), controller.login);
authRouter.post('/refresh', validate(refresh), controller.refresh);
authRouter.post('/logout', authenticate, controller.logout);
authRouter.get('/me', authenticate, controller.me);
