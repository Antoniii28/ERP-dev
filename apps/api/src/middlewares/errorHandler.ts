import type { NextFunction, Request, Response } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'No tienes permisos suficientes') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} no encontrado`, 404);
    this.name = 'NotFoundError';
  }
}

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new NotFoundError(`Ruta ${req.originalUrl}`));
};

export const errorHandler = (
  error: Error & { statusCode?: number; isOperational?: boolean },
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  void _next;

  const statusCode = error.statusCode ?? 500;
  const publicMessage = statusCode >= 500 && process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : (error.message || 'Error interno del servidor');

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    data: null,
    message: publicMessage,
    ...(process.env.NODE_ENV !== 'production' && statusCode >= 500 ? { stack: error.stack } : {}),
  });
};
