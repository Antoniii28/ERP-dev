import { describe, expect, it } from 'vitest';
import { createToken, hashPassword, verifyPassword, verifyToken } from './security.js';

describe('security utilities', () => {
  it('verifies password hashes', () => {
    const hash = hashPassword('TestPassword123');
    expect(verifyPassword('TestPassword123', hash)).toBe(true);
    expect(verifyPassword('WrongPassword123', hash)).toBe(false);
  });

  it('verifies access token type', () => {
    const token = createToken('user-123', 'access');
    expect(verifyToken(token, 'access').sub).toBe('user-123');
    expect(() => verifyToken(token, 'refresh')).toThrow();
  });
});
