// apps/backend/src/modules/audit/application/audit-log.service.ts
// AuditLogService — Mongoose repository ile (Prisma → Mongoose migration)
// ADR-005 Faz 2a — Pilot modül

import { Injectable, Logger } from '@nestjs/common';
import { AuditLogRepository } from '@barterborsa/shared-persistence/mongodb/audit/audit-log.repository';

export interface AuditLogEntry {
  actorId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly auditLogRepo: AuditLogRepository) {}

  async log(entry: AuditLogEntry): Promise<void> {
    // Fire-and-forget: audit log ana işlemi bloke etmemeli
    // Hata durumunda sessizce loglanır (catch içinde)
    this.auditLogRepo.create({
      id: '', // cuid repository'de üretilir
      actorId: entry.actorId,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      oldValue: entry.oldValue,
      newValue: entry.newValue,
      ipAddress: entry.ipAddress,
      createdAt: new Date(),
    }).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error('AuditLog kaydedilemedi', { entry, error: msg });
    });
  }

  async findByActor(actorId: string, limit = 100) {
    return this.auditLogRepo.findByActor(actorId, limit);
  }

  async findByResource(resourceType: string, resourceId: string, limit = 50) {
    return this.auditLogRepo.findByResource(resourceType, resourceId, limit);
  }

  async findByAction(action: string, limit = 100) {
    return this.auditLogRepo.findByAction(action, limit);
  }
}