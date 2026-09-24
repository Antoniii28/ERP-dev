import 'dotenv/config';
import { envSchema } from '@erp/validation';

const rawEnv = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: process.env.PORT ?? '4000',
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET ?? 'development-secret-change-me',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? 'development-refresh-secret-change-me',
  CORS_ORIGINS: process.env.CORS_ORIGINS ?? 'http://localhost:5173',
};

const parsedEnv = envSchema.safeParse(rawEnv);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues.map((issue) => issue.message).join('; ');
  throw new Error(`Invalid environment configuration: ${issues}`);
}

export const env = parsedEnv.data;
