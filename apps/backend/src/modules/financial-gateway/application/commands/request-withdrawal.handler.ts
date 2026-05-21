import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { FinancialGatewayService } from '../../financial-gateway.service';
import { RequestWithdrawalCommand } from './request-withdrawal.command';
import { AuditLogService } from '../../../audit/application/audit-log.service';

@CommandHandler(RequestWithdrawalCommand)
export class RequestWithdrawalHandler
  implements ICommandHandler<RequestWithdrawalCommand> {
  private readonly logger = new Logger(RequestWithdrawalHandler.name);

  constructor(
    private readonly financialGateway: FinancialGatewayService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: RequestWithdrawalCommand) {
    const { userId, amount, iban, accountHolder, bankName } = command;
    const idempotencyKey = `withdrawal-${userId}-${Date.now()}`;

    const result = await this.financialGateway.requestWithdrawal({
      userId,
      amount: amount.toString(),
      iban,
      accountHolder,
      bankName,
      idempotencyKey
    });

    // Audit log — çekim talebi
    await this.auditLog.log({
      actorId: userId,
      action: 'WALLET_WITHDRAWAL_REQUEST',
      resourceType: 'WALLET',
      resourceId: userId,
      newValue: { amount, iban: iban.slice(-4).padStart(iban.length, '*'), bankName }, // IBAN maskelenmiş
    });

    return result;
  }
}
