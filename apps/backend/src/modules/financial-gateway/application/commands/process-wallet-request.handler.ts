import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProcessWalletRequestCommand } from './process-wallet-request.command';
import { FinancialGatewayService } from '../../financial-gateway.service';
import { AuditLogService } from '../../../audit/application/audit-log.service';

@CommandHandler(ProcessWalletRequestCommand)
export class ProcessWalletRequestHandler implements ICommandHandler<ProcessWalletRequestCommand> {
  constructor(
    private readonly financialGateway: FinancialGatewayService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: ProcessWalletRequestCommand): Promise<unknown> {
    const result = await this.financialGateway.processWalletRequest({
      requestId: command.requestId,
      action: command.action,
      adminId: command.adminId,
      reason: command.reason,
    });

    // Audit log — admin yükleme onay/red
    await this.auditLog.log({
      actorId: command.adminId,
      action: command.action === 'approve' ? 'TOPUP_APPROVED' : 'TOPUP_REJECTED',
      resourceType: 'WALLET_TOPUP_REQUEST',
      resourceId: command.requestId,
      newValue: { action: command.action, reason: command.reason },
    });

    return result;
  }
}
