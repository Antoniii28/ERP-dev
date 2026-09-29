import { Router } from 'express';

import { authRouter } from './auth.js';
import { branchesRouter } from './branches.js';
import { companiesRouter } from './companies.js';
import { coreOperationsRouter } from './coreOperations.js';
import { healthRouter } from './health.js';
import { rolesRouter } from './roles.js';
import { usersRouter } from './users.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/roles', rolesRouter);
apiRouter.use('/companies', companiesRouter);
apiRouter.use('/branches', branchesRouter);
apiRouter.use('/', coreOperationsRouter);
