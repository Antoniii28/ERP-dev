import type { NextFunction, Request, Response } from 'express';

export const notFoundMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  next(new Error(`Ruta no encontrada: ${req.originalUrl}`));
};
