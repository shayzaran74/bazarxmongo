import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { FinancialGatewayService } from '../../financial-gateway.service';
import { RequestWithdrawalCommand } from './request-withdrawal.command';

@CommandHandler(RequestWithdrawalCommand)
export class RequestWithdrawalHandler
  implements ICommandHandler<RequestWithdrawalCommand> {
  private readonly logger = new Logger(RequestWithdrawalHandler.name);

  constructor(
    private readonly financialGateway: FinancialGatewayService
  ) {}

  async execute(command: RequestWithdrawalCommand) {
    const { userId, amount, iban, accountHolder, bankName } = command;
    const idempotencyKey = `withdrawal-${userId}-${Date.now()}`;

    return this.financialGateway.requestWithdrawal({
      userId,
      amount: amount.toString(),
      iban,
      accountHolder,
      bankName,
      idempotencyKey
    });
  }
}
