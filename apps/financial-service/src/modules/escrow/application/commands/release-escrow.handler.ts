import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReleaseEscrowCommand } from './release-escrow.command';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { Escrow } from '../../domain/entities/escrow.entity';

@CommandHandler(ReleaseEscrowCommand)
export class ReleaseEscrowHandler implements ICommandHandler<ReleaseEscrowCommand> {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: ReleaseEscrowCommand): Promise<void> {
    const { orderId } = command;

    await this.prisma.$transaction(async (tx) => {
      // 1. Atomik okuma ve idempotency kontrolü
      const escrow = await tx.escrow.findUnique({ where: { orderId } });

      if (!escrow) throw new Error(`Escrow kaydı bulunamadı: ${orderId}`);

      // Ağ retry'ları için: zaten çözülmüşse hata verme
      if (escrow.status === 'RELEASED') return;

      // Sadece FUNDED durumdaki escrow çözülebilir
      if (escrow.status !== 'FUNDED') {
        throw new Error(`Escrow bu durumdan serbest bırakılamaz: ${escrow.status}`);
      }

      const escrowEntity = Escrow.fromPersistence(escrow);
      escrowEntity.release();

      // 2. Satıcı cüzdanını güncelle veya oluştur (atomic upsert)
      await tx.wallet.upsert({
        where: { userId: escrow.sellerId },
        update: { balanceTL: { increment: escrow.amount } },
        create: {
          userId: escrow.sellerId,
          balanceTL: escrow.amount,
          barterBalance: 0,
          xpPoints: 0,
          xpAdsBalance: 0,
          xpTradeBalance: 0,
          xpCommissionBalance: 0,
        },
      });

      // 3. Satıcının MAIN hesabını bul; yoksa tüm varsayılan hesapları oluştur
      let sellerMainAccount = await tx.account.findFirst({
        where: { userId: escrow.sellerId, type: 'MAIN' },
      });

      if (!sellerMainAccount) {
        await tx.account.createMany({
          data: [
            { userId: escrow.sellerId, type: 'MAIN', currency: 'TRY' },
            { userId: escrow.sellerId, type: 'BARTER', currency: 'BARTER' },
            { userId: escrow.sellerId, type: 'XP_COMMISSION', currency: 'TRY' },
            { userId: escrow.sellerId, type: 'XP_ADS', currency: 'TRY' },
          ],
          skipDuplicates: true,
        });
        sellerMainAccount = await tx.account.findFirst({
          where: { userId: escrow.sellerId, type: 'MAIN' },
        });
      }

      // 4. Escrow durumunu güncelle
      await tx.escrow.update({
        where: { orderId },
        data: {
          status: 'RELEASED',
          releasedAt: escrowEntity.releasedAt,
          releasedAmount: escrowEntity.releasedAmount,
          updatedAt: escrowEntity.updatedAt,
        },
      });

      // 5. Muhasebe kaydı
      await tx.generalLedger.create({
        data: {
          type: 'ESCROW_RELEASE',
          debitAccountId: 'SYSTEM_ESCROW_ACCOUNT',
          creditAccountId: escrow.sellerId,
          amount: escrow.amount,
          referenceId: orderId,
          refType: 'ORDER',
          note: `Order ${orderId} emanet ödemesi satıcıya aktarıldı.`,
        },
      });

      // 6. Account Transaction ve bakiye senkronizasyonu — hesap her zaman mevcut
      if (sellerMainAccount) {
        await tx.accountTransaction.create({
          data: {
            accountId: sellerMainAccount.id,
            type: 'RELEASE',
            direction: 'CREDIT',
            amount: escrow.amount,
            description: `Sipariş #${orderId} ödemesi cüzdanınıza eklendi.`,
            referenceId: orderId,
            referenceType: 'ORDER',
            status: 'COMPLETED',
          },
        });

        await tx.account.update({
          where: { id: sellerMainAccount.id },
          data: {
            balance: { increment: escrow.amount },
            availableBalance: { increment: escrow.amount },
          },
        });
      }
    });
  }
}
