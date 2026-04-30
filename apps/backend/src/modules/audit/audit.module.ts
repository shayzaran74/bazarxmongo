// apps/backend/src/modules/audit/audit.module.ts

import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '@barterborsa/shared-persistence';
import { AuditLogService } from './application/audit-log.service';

// Global olarak işaretlendiği için diğer modüller import etmeden inject edebilir
@Global()
@Module({
  imports: [PrismaModule],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditModule {}
