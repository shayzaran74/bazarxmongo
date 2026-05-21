import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProcessWithdrawalCommand } from './process-withdrawal.command';
import { FinancialGatewayService } from '../../financial-gateway.service';
import { AuditLogService } from '../../../audit/application/audit-log.service';

@CommandHandler(ProcessWithdrawalCommand)
export class ProcessWithdrawalHandler implements ICommandHandler<ProcessWithdrawalCommand> {
  constructor(
    private readonly financialGateway: FinancialGatewayService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: ProcessWithdrawalCommand): Promise<unknown> {
    const result = await this.financialGateway.processWithdrawal({
      withdrawalId: command.withdrawalId,
      action: command.action,
      adminId: command.adminId,
      reason: command.reason,
    });

    // Audit log — admin çekim onay/red
    await this.auditLog.log({
      actorId: command.adminId,
      action: command.action === 'approve' ? 'WITHDRAWAL_APPROVED' : 'WITHDRAWAL_REJECTED',
      resourceType: 'WALLET_WITHDRAWAL',
      resourceId: command.withdrawalId,
      newValue: { action: command.action, reason: command.reason },
    });

    return result;
  }
}
