import { describe, expect, it } from 'vitest';
import { scopedCompanyId, type AuthRequest } from '../../apps/api/src/middlewares/auth.js';

describe('tenant company scope', () => {
  it('uses the company assigned to the authenticated user', () => {
    const req = { auth: { userId: 'u1', permissions: [], companyId: 'company-a' } } as unknown as AuthRequest;
    expect(scopedCompanyId(req)).toBe('company-a');
    expect(scopedCompanyId(req, 'company-a')).toBe('company-a');
  });

  it('rejects a different requested company', () => {
    const req = { auth: { userId: 'u1', permissions: [], companyId: 'company-a' } } as unknown as AuthRequest;
    expect(() => scopedCompanyId(req, 'company-b')).toThrow('No tienes acceso a esta empresa');
  });

  it('allows platform context to select a company', () => {
    const req = { auth: { userId: 'platform', permissions: ['*'] } } as unknown as AuthRequest;
    expect(scopedCompanyId(req, 'company-b')).toBe('company-b');
  });
});
