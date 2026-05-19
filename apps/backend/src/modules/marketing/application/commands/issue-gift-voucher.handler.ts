// apps/backend/src/modules/marketing/application/commands/issue-gift-voucher.handler.ts
// Master Plan v4.3 §2.4 — Sürpriz hediye çeki (cashback alternatifi)

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GiftVoucher } from '@barterborsa/shared-persistence/schemas/backend/giftVoucher.schema';
import { IssueGiftVoucherCommand } from './issue-gift-voucher.command';
import { randomBytes } from 'crypto';

function generateVoucherCode(): string {
  return 'BZX-' + randomBytes(4).toString('hex').toUpperCase();
}

@CommandHandler(IssueGiftVoucherCommand)
export class IssueGiftVoucherHandler implements ICommandHandler<IssueGiftVoucherCommand> {
  private readonly logger = new Logger(IssueGiftVoucherHandler.name);

  async execute(command: IssueGiftVoucherCommand) {
    const { userId, amount, type, issuedBy, validDays } = command;

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    const code = generateVoucherCode();
    const id = 'gv-' + Date.now() + '-' + Math.random().toString(36).substring(7);

    const voucher = await GiftVoucher.create({
      id,
      userId,
      code,
      amount,
      type,
      validUntil,
      issuedBy,
    });

    this.logger.log('Hediye çeki oluşturuldu', { userId, type, amount, code });

    return {
      success: true,
      data: {
        code,
        amount,
        type,
        validUntil,
        voucherId: id,
      },
    };
  }
}
