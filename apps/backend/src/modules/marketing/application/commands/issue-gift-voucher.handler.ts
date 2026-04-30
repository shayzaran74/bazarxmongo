// apps/backend/src/modules/marketing/application/commands/issue-gift-voucher.handler.ts
// Master Plan v4.3 §2.4 — Sürpriz hediye çeki (cashback alternatifi)

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { IssueGiftVoucherCommand } from './issue-gift-voucher.command';
import { randomBytes } from 'crypto';

function generateVoucherCode(): string {
  return 'BZX-' + randomBytes(4).toString('hex').toUpperCase();
}

@CommandHandler(IssueGiftVoucherCommand)
export class IssueGiftVoucherHandler implements ICommandHandler<IssueGiftVoucherCommand> {
  private readonly logger = new Logger(IssueGiftVoucherHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: IssueGiftVoucherCommand) {
    const { userId, amount, type, issuedBy, validDays } = command;

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    const code = generateVoucherCode();

    const voucher = await this.prisma.giftVoucher.create({
      data: {
        userId,
        code,
        amount,
        type,
        validUntil,
        issuedBy,
      },
    });

    this.logger.log('Hediye çeki oluşturuldu', { userId, type, amount, code });

    return {
      success: true,
      data: {
        code,
        amount,
        type,
        validUntil,
        voucherId: voucher.id,
      },
    };
  }
}
