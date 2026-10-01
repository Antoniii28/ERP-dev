import type { ClientSession, Types } from 'mongoose';
import { AuditLogModel } from '../models/AuditLog.js';

export const writeAudit = async (input: {
  actorId: string;
  companyId?: string | null;
  action: string;
  entityType: string;
  entityId?: Types.ObjectId | string | null;
  metadata?: Record<string, unknown>;
}, session?: ClientSession) => {
  const document = {
    actorId: input.actorId,
    companyId: input.companyId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    metadata: input.metadata ?? {},
  };
  if (session) { await AuditLogModel.create([document], { session }); return; }
  try { await AuditLogModel.create(document); } catch (error) { console.error('Audit log write failed:', error); }
};
