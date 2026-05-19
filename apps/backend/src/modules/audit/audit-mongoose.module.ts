// apps/backend/src/modules/audit/audit-mongoose.module.ts
// AuditModule — Prisma → Mongoose migration (ADR-005 Faz 2a, pilot modül)
// Not: Bu modül Prisma yerine Mongoose kullanır. Test için.
// TODO: strict typing — codegen

import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLogService } from './application/audit-log.service';
import { LogsAdminController } from './presentation/logs-admin.controller';
import { AuditLog, AuditLogSchema } from '@barterborsa/shared-persistence/schemas/backend/auditLog.schema';
import { AuditLogRepository } from '@barterborsa/shared-persistence/mongodb/audit/audit-log.repository';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [LogsAdminController],
  providers: [
    AuditLogService,
    AuditLogRepository,
  ],
  exports: [AuditLogService, AuditLogRepository],
})
export class AuditMongooseModule {
  constructor() {
    console.log('[AuditMongooseModule] Mongoose ile yüklendi — pilot test için.');
  }
}