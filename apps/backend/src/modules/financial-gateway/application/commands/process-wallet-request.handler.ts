import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProcessWalletRequestCommand } from './process-wallet-request.command';
import { FinancialGatewayService } from '../../financial-gateway.service';

@CommandHandler(ProcessWalletRequestCommand)
export class ProcessWalletRequestHandler implements ICommandHandler<ProcessWalletRequestCommand> {
  constructor(private readonly financialGateway: FinancialGatewayService) {}

  async execute(command: ProcessWalletRequestCommand): Promise<any> {
    return this.financialGateway.processWalletRequest({
      requestId: command.requestId,
      action: command.action,
      adminId: command.adminId,
      reason: command.reason,
    });
  }
}
