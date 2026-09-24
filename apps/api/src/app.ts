import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { apiRouter } from './routes/index.js';

export const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGINS.split(',').map((origin: string) => origin.trim()).filter(Boolean),
    credentials: true,
  }),
);

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
    },
    message: 'API funcionando correctamente',
  });
});

app.use('/api/v1', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.locals.env = env;
