import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { apiRouter } from './routes/index.js';

export const app = express();

if (env.NODE_ENV === 'production') app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  cors({
    origin: env.CORS_ORIGINS.split(',').map((origin: string) => origin.trim()).filter(Boolean),
    credentials: true,
  }),
);

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/api/v1', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.locals.env = env;
