import { describe, expect, it, vi } from 'vitest';
import { requirePermission, type AuthRequest } from '../../apps/api/src/middlewares/auth.js';

describe('RBAC permission middleware', () => {
  it('accepts an explicit permission', () => {
    const next = vi.fn();
    requirePermission('users.read')({ auth: { userId: 'u1', permissions: ['users.read'] } } as AuthRequest, {} as never, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('accepts wildcard administrator permission', () => {
    const next = vi.fn();
    requirePermission('users.update')({ auth: { userId: 'admin', permissions: ['*'] } } as AuthRequest, {} as never, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('rejects a missing permission', () => {
    const next = vi.fn();
    requirePermission('users.update')({ auth: { userId: 'u1', permissions: ['users.read'] } } as AuthRequest, {} as never, next);
    expect(next.mock.calls[0]?.[0]).toBeInstanceOf(Error);
  });
});
