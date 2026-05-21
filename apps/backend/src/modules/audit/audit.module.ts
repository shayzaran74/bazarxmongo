import { Global, Module, Logger } from '@nestjs/common';
import { AuditLogService } from './application/audit-log.service';
import { LogsAdminController } from './presentation/logs-admin.controller';
import { MediaModule } from '../media/media.module';

// Global olarak işaretlendiği için diğer modüller import etmeden inject edebilir
@Global()
@Module({
  imports: [MediaModule],
  controllers: [LogsAdminController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditModule {
  private readonly logger = new Logger(AuditModule.name);

  constructor() {
    this.logger.log('Modül yüklendi.');
  }
}
