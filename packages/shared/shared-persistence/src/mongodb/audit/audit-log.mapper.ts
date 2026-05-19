// packages/shared/shared-persistence/src/mongodb/audit/audit-log.mapper.ts
// AuditLog — Prisma payload → Mongoose Document → Domain

import { IAuditLog } from '../../schemas/backend/auditLog.schema';

export interface AuditLogDomain {
  id: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class AuditLogMapper {
  // Mongoose Document → Domain
  static toDomain(doc: IAuditLog): AuditLogDomain {
    return {
      id: doc.id,
      actorId: doc.actorId,
      action: doc.action,
      resourceType: doc.resourceType,
      resourceId: doc.resourceId,
      oldValue: doc.oldValue as unknown as Record<string, unknown> | undefined,
      newValue: doc.newValue as unknown as Record<string, unknown> | undefined,
      ipAddress: doc.ipAddress,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  // Domain → MongoDB persistence
  static toPersistence(domain: AuditLogDomain): Record<string, unknown> {
    return {
      _id: domain.id,
      actorId: domain.actorId,
      action: domain.action,
      resourceType: domain.resourceType,
      resourceId: domain.resourceId,
      oldValue: domain.oldValue,
      newValue: domain.newValue,
      ipAddress: domain.ipAddress,
      createdAt: domain.createdAt,
    };
  }
}