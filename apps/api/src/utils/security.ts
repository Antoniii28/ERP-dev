import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

import { env } from '../config/index.js';
import { AuthenticationError } from '../middlewares/errorHandler.js';

type TokenType = 'access' | 'refresh';
export interface TokenPayload { sub: string; type: TokenType; exp: number; }

const encode = (value: string): string => Buffer.from(value).toString('base64url');
const sign = (input: string, secret: string): string => createHmac('sha256', secret).update(input).digest('base64url');

export const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
};

export const verifyPassword = (password: string, stored: string): boolean => {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};

export const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex');

export const createToken = (sub: string, type: TokenType): string => {
  const secret = type === 'access' ? env.JWT_SECRET : env.JWT_REFRESH_SECRET;
  const ttl = type === 'access' ? 15 * 60 : 7 * 24 * 60 * 60;
  const header = encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = encode(JSON.stringify({ sub, type, exp: Math.floor(Date.now() / 1000) + ttl }));
  const unsigned = `${header}.${payload}`;
  return `${unsigned}.${sign(unsigned, secret)}`;
};

export const verifyToken = (token: string, expectedType: TokenType): TokenPayload => {
  const parts = token.split('.');
  if (parts.length !== 3) throw new AuthenticationError('Token inválido');
  const [header, payload, signature] = parts as [string, string, string];
  const secret = expectedType === 'access' ? env.JWT_SECRET : env.JWT_REFRESH_SECRET;
  const expected = sign(`${header}.${payload}`, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new AuthenticationError('Token inválido');
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()) as TokenPayload;
    if (parsed.type !== expectedType || parsed.exp <= Math.floor(Date.now() / 1000) || !parsed.sub) {
      throw new AuthenticationError('Token expirado o inválido');
    }
    return parsed;
  } catch (error) {
    if (error instanceof AuthenticationError) throw error;
    throw new AuthenticationError('Token inválido');
  }
};
