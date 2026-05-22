import { Module, Logger } from '@nestjs/common';
import { AuditLogService } from './application/audit-log.service';
import { LogsAdminController } from './presentation/logs-admin.controller';
import { MediaModule } from '../media/media.module';

// Modül explicit import edilmelidir
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
