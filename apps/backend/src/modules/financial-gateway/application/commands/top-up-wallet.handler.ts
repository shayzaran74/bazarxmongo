import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { FinancialGatewayService } from '../../financial-gateway.service';
import { TopUpWalletCommand } from './top-up-wallet.command';
import { AuditLogService } from '../../../audit/application/audit-log.service';

@CommandHandler(TopUpWalletCommand)
export class TopUpWalletHandler
  implements ICommandHandler<TopUpWalletCommand> {
  private readonly logger = new Logger(TopUpWalletHandler.name);

  constructor(
    private readonly financialGateway: FinancialGatewayService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: TopUpWalletCommand) {
    const { userId, amount, paymentMethod } = command;
    const idempotencyKey = `topup-${userId}-${Date.now()}`;

    await this.financialGateway.topUpWallet(
      userId,
      amount.toString(),
      paymentMethod,
      idempotencyKey
    );

    // Audit log — bakiye yükleme talebi
    await this.auditLog.log({
      actorId: userId,
      action: 'WALLET_TOPUP_REQUEST',
      resourceType: 'WALLET',
      resourceId: userId,
      newValue: { amount, paymentMethod },
    });
  }
}
