import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApproveTopUpCommand } from './approve-topup.command';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { NotFoundException } from '@barterborsa/shared-core';

@CommandHandler(ApproveTopUpCommand)
export class ApproveTopUpHandler implements ICommandHandler<ApproveTopUpCommand> {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: ApproveTopUpCommand): Promise<void> {
    const { requestId, adminId } = command;

    // Durum güncellemesi + cüzdan bakiyesi + muhasebe kaydı tek transaction içinde.
    // Herhangi bir adım başarısız olursa tüm işlem geri alınır — para kaybı önlenir.
    await this.prisma.$transaction(async (tx) => {
      // Transaction içinde atomic okuma (TOCTOU önlemi)
      const request = await tx.accountTopUpRequest.findUnique({
        where: { id: requestId },
      });

      if (!request) {
        throw new NotFoundException(`Top-up isteği bulunamadı: ${requestId}`);
      }

      if (request.status !== 'PENDING') {
        throw new Error(`İstek zaten işlenmiş durumda: ${request.status}`);
      }

      // 1. İstek durumunu onayla
      await tx.accountTopUpRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          processedAt: new Date(),
          processedBy: adminId,
        },
      });

      // 2. Kullanıcı cüzdanına bakiye ekle
      await tx.wallet.upsert({
        where: { userId: request.userId },
        update: { balanceTL: { increment: request.amount } },
        create: {
          userId: request.userId,
          balanceTL: request.amount,
          barterBalance: 0,
          xpPoints: 0,
          xpAdsBalance: 0,
          xpTradeBalance: 0,
          xpCommissionBalance: 0,
        },
      });

      // 3. Account tablosunu senkronize et (MAIN hesap)
      const mainAccount = await tx.account.findFirst({
        where: { userId: request.userId, type: 'MAIN' },
      });
      if (mainAccount) {
        await tx.account.update({
          where: { id: mainAccount.id },
          data: {
            balance: { increment: request.amount },
            availableBalance: { increment: request.amount },
          },
        });
      }

      // 4. Muhasebe kaydı (General Ledger)
      await tx.generalLedger.create({
        data: {
          type: 'DEPOSIT',
          debitAccountId: 'SYSTEM_BANK_ACCOUNT',
          creditAccountId: request.userId,
          amount: request.amount,
          referenceId: `APPROVE-${requestId}`,
          refType: 'TOPUP',
          note: `Admin onaylı bakiye yükleme (İstek: ${requestId}, Admin: ${adminId})`,
        },
      });
    });
  }
}
