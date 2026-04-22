import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { FinancialGatewayService } from '../../financial-gateway.service';
import { TopUpWalletCommand } from './top-up-wallet.command';

@CommandHandler(TopUpWalletCommand)
export class TopUpWalletHandler
  implements ICommandHandler<TopUpWalletCommand> {
  private readonly logger = new Logger(TopUpWalletHandler.name);

  constructor(
    private readonly financialGateway: FinancialGatewayService
  ) {}

  async execute(command: TopUpWalletCommand) {
    const { userId, amount, paymentMethod } = command;
    const idempotencyKey = `topup-${userId}-${Date.now()}`;

    return this.financialGateway.topUpWallet(
      userId,
      amount.toString(),
      paymentMethod,
      idempotencyKey
    );
  }
}
