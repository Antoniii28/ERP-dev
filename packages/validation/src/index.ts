import { z } from 'zod';

export const healthCheckSchema = z.object({
  status: z.literal('ok'),
});

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().optional(),
  JWT_SECRET: z.string().min(32).default('development-secret-change-me-32chars'),
  JWT_REFRESH_SECRET: z.string().min(32).default('development-refresh-secret-change-me-32chars'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().default('JAFORA ERP <onboarding@resend.dev>'),
  WEB_URL: z.string().url().default('http://localhost:5173'),
});

export type HealthCheck = z.infer<typeof healthCheckSchema>;
export type EnvConfig = z.infer<typeof envSchema>;
