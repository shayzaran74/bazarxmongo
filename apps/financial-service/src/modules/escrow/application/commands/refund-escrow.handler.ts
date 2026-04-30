import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefundEscrowCommand } from './refund-escrow.command';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { Escrow } from '../../domain/entities/escrow.entity';

@CommandHandler(RefundEscrowCommand)
export class RefundEscrowHandler implements ICommandHandler<RefundEscrowCommand> {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: RefundEscrowCommand): Promise<void> {
    const { orderId, reason } = command;

    await this.prisma.$transaction(async (tx) => {
      // 1. Atomik okuma ve mükerrer kontrol
      const escrow = await tx.escrow.findUnique({ where: { orderId } });

      if (!escrow) throw new Error(`Escrow kaydı bulunamadı: ${orderId}`);

      // Ağ retry'ları için: zaten iade edilmişse başarılı say
      if (escrow.status === 'REFUNDED') return;

      // Sadece FUNDED durumdaki escrow iade edilebilir
      if (escrow.status !== 'FUNDED') {
        throw new Error(`Escrow bu durumdan iade edilemez: ${escrow.status}`);
      }

      const escrowEntity = Escrow.fromPersistence(escrow);
      escrowEntity.refund();

      // 2. Alıcı cüzdanı — escrow oluşturulduğunda mevcuttu, yine de güvenli upsert
      const buyerWallet = await tx.wallet.findUnique({ where: { userId: escrow.buyerId } });
      if (!buyerWallet) throw new Error(`Alıcı cüzdanı bulunamadı: ${escrow.buyerId}`);

      // 3. Alıcının MAIN hesabını bul; yoksa varsayılan hesapları aç
      let buyerMainAccount = await tx.account.findFirst({
        where: { userId: escrow.buyerId, type: 'MAIN' },
      });

      if (!buyerMainAccount) {
        await tx.account.createMany({
          data: [
            { userId: escrow.buyerId, type: 'MAIN', currency: 'TRY' },
            { userId: escrow.buyerId, type: 'BARTER', currency: 'BARTER' },
            { userId: escrow.buyerId, type: 'XP_COMMISSION', currency: 'TRY' },
            { userId: escrow.buyerId, type: 'XP_ADS', currency: 'TRY' },
          ],
          skipDuplicates: true,
        });
        buyerMainAccount = await tx.account.findFirst({
          where: { userId: escrow.buyerId, type: 'MAIN' },
        });
      }

      // 4. Atomik yazma
      // a. Legacy cüzdan iadesi
      await tx.wallet.update({
        where: { userId: escrow.buyerId },
        data: { balanceTL: { increment: escrow.amount } },
      });

      // b. Escrow durumu güncelle
      await tx.escrow.update({
        where: { orderId },
        data: { status: 'REFUNDED', updatedAt: escrowEntity.updatedAt },
      });

      // c. Muhasebe kaydı
      await tx.generalLedger.create({
        data: {
          type: 'REFUND',
          debitAccountId: 'SYSTEM_ESCROW_ACCOUNT',
          creditAccountId: escrow.buyerId,
          amount: escrow.amount,
          referenceId: orderId,
          refType: 'ORDER',
          note: `Order ${orderId} iadesi alıcıya aktarıldı. Sebep: ${reason || 'İptal'}`,
        },
      });

      // d. Account Transaction ve bakiye senkronizasyonu — hesap artık kesinlikle mevcut
      if (buyerMainAccount) {
        await tx.accountTransaction.create({
          data: {
            accountId: buyerMainAccount.id,
            type: 'REFUND',
            direction: 'CREDIT',
            amount: escrow.amount,
            description: `İade: Sipariş #${orderId} tutarı cüzdanınıza geri yüklendi.`,
            referenceId: orderId,
            referenceType: 'ORDER',
            status: 'COMPLETED',
          },
        });

        await tx.account.update({
          where: { id: buyerMainAccount.id },
          data: {
            balance: { increment: escrow.amount },
            availableBalance: { increment: escrow.amount },
          },
        });
      }
    });
  }
}
