import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProcessWithdrawalCommand } from './process-withdrawal.command';
import { FinancialGatewayService } from '../../financial-gateway.service';

@CommandHandler(ProcessWithdrawalCommand)
export class ProcessWithdrawalHandler implements ICommandHandler<ProcessWithdrawalCommand> {
  constructor(private readonly financialGateway: FinancialGatewayService) {}

  async execute(command: ProcessWithdrawalCommand): Promise<any> {
    return this.financialGateway.processWithdrawal({
      withdrawalId: command.withdrawalId,
      action: command.action,
      adminId: command.adminId,
      reason: command.reason,
    });
  }
}
