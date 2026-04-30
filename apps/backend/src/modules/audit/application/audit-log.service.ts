// apps/backend/src/modules/audit/application/audit-log.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';

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

  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId:      entry.actorId,
          action:       entry.action,
          resourceType: entry.resourceType,
          resourceId:   entry.resourceId,
          oldValue:     entry.oldValue as object | undefined,
          newValue:     entry.newValue as object | undefined,
          ipAddress:    entry.ipAddress,
        },
      });
    } catch (err: unknown) {
      // Audit log hatası ana işlemi durdurmamalı — sadece loglanır
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error('AuditLog kaydedilemedi', { entry, error: msg });
    }
  }
}
