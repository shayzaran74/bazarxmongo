// apps/financial-service/src/modules/wallet/application/commands/topup-wallet.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TopUpWalletCommand } from './topup-wallet.command';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@CommandHandler(TopUpWalletCommand)
export class TopUpWalletHandler implements ICommandHandler<TopUpWalletCommand> {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: TopUpWalletCommand): Promise<void> {
    const { userId, amount, currency, idempotencyKey } = command;

    // Giriş doğrulama
    if (!amount.isPositive()) {
      throw new Error('Yükleme tutarı sıfırdan büyük olmalıdır.');
    }

    if (currency !== 'TRY') {
      throw new Error(`${currency} için bakiye yükleme henüz desteklenmiyor.`);
    }

    const referenceId = idempotencyKey || `topup-${Date.now()}`;

    // Tüm yazma işlemleri atomik: cüzdan + hesap + muhasebe aynı transaction içinde
    await this.prisma.$transaction(async (tx) => {
      // Mükerrer işlem kontrolü — aynı referenceId ile daha önce işlem yapıldıysa atla
      const existing = await tx.generalLedger.findFirst({
        where: { referenceId, refType: 'TOPUP' },
      });
      if (existing) return;

      // Cüzdanı güncelle veya sıfır bakiyeyle oluştur
      await tx.wallet.upsert({
        where: { userId },
        update: { balanceTL: { increment: amount } },
        create: {
          userId,
          balanceTL: amount,
          barterBalance: 0,
          xpPoints: 0,
          xpAdsBalance: 0,
          xpTradeBalance: 0,
          xpCommissionBalance: 0,
        },
      });

      // Modern Account tablosunu senkronize et (MAIN hesap)
      const mainAccount = await tx.account.upsert({
        where: { userId_type: { userId, type: 'MAIN' } },
        update: {
          balance: { increment: amount },
          availableBalance: { increment: amount },
        },
        create: {
          userId,
          type: 'MAIN',
          balance: amount,
          availableBalance: amount,
          currency: 'TRY',
          status: 'ACTIVE',
          ownerType: 'CUSTOMER'
        },
      });

      // 4. Hesap hareketi oluştur
      if (mainAccount) {
        await tx.accountTransaction.create({
          data: {
            accountId: mainAccount.id,
            type: 'TOPUP',
            direction: 'CREDIT',
            amount,
            status: 'COMPLETED',
            description: `Cüzdan bakiye yükleme (${currency})`,
            referenceId,
            referenceType: 'TOPUP',
          },
        });
      }

      // 5. Muhasebe kaydı (General Ledger)
      await tx.generalLedger.create({
        data: {
          type: 'DEPOSIT',
          debitAccountId: 'SYSTEM_BANK_ACCOUNT',
          creditAccountId: userId,
          amount,
          referenceId,
          refType: 'TOPUP',
          note: `Cüzdan bakiye yükleme (${currency})`,
        },
      });
    });
  }
}
