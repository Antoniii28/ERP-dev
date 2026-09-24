import { z } from 'zod';

export const healthCheckSchema = z.object({
  status: z.literal('ok'),
});

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().optional(),
  JWT_SECRET: z.string().min(16).default('development-secret-change-me'),
  JWT_REFRESH_SECRET: z.string().min(16).default('development-refresh-secret-change-me'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
});

export type HealthCheck = z.infer<typeof healthCheckSchema>;
export type EnvConfig = z.infer<typeof envSchema>;
