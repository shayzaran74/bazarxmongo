import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '@barterborsa/shared-persistence';
import { AuditLogService } from './application/audit-log.service';
import { LogsAdminController } from './presentation/logs-admin.controller';
import { MediaModule } from '../media/media.module';

// Global olarak işaretlendiği için diğer modüller import etmeden inject edebilir
@Global()
@Module({
  imports: [PrismaModule, MediaModule],
  controllers: [LogsAdminController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditModule {}
