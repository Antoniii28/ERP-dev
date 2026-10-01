import type { Types } from 'mongoose';
import { AuditLogModel } from '../models/AuditLog.js';

export const writeAudit = async (input: {
  actorId: string;
  companyId?: string | null;
  action: string;
  entityType: string;
  entityId?: Types.ObjectId | string | null;
  metadata?: Record<string, unknown>;
}) => {
  await AuditLogModel.create({
    actorId: input.actorId,
    companyId: input.companyId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    metadata: input.metadata ?? {},
  });
};
