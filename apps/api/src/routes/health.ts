import { Router } from 'express';

import { getDatabaseStatus } from '../config/database.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  const database = getDatabaseStatus();
  const healthy = database === 'connected' || database === 'disconnected';

  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      database,
    },
    message: healthy
      ? 'API funcionando correctamente'
      : 'API funcionando; conexión con MongoDB en proceso',
  });
});
