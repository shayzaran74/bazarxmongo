import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReleaseEscrowCommand } from './release-escrow.command';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { Escrow } from '../../domain/entities/escrow.entity';
import { CommissionCalculatorService } from '../../../commission/domain/services/commission-calculator.service';
import { Decimal } from 'decimal.js';

@CommandHandler(ReleaseEscrowCommand)
export class ReleaseEscrowHandler implements ICommandHandler<ReleaseEscrowCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commissionCalculator: CommissionCalculatorService,
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

      // 2. Satıcının hesabını ve tier bilgisini al
      let sellerMainAccount = await tx.account.findFirst({
        where: { userId: escrow.sellerId, type: 'MAIN' },
      });

      if (!sellerMainAccount) {
        // Hesap yoksa oluştur (varsayılan CORE tier)
        await tx.account.createMany({
          data: [
            { userId: escrow.sellerId, type: 'MAIN', currency: 'TRY', vendorTier: 'CORE' },
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

      // 3. Komisyon Hesapla (Master Plan v4.3)
      const vendorTier = sellerMainAccount?.vendorTier || 'CORE';
      const commissionResult = this.commissionCalculator.calculateSimple(
        new Decimal(escrow.amount.toString()),
        vendorTier
      );
      
      const commissionAmount = commissionResult.commission;
      const netAmount = new Decimal(escrow.amount.toString()).sub(commissionAmount);

      // 4. Cüzdanları Güncelle
      // a. Satıcıya NET tutarı aktar
      await tx.wallet.upsert({
        where: { userId: escrow.sellerId },
        update: { balanceTL: { increment: netAmount } },
        create: {
          userId: escrow.sellerId,
          balanceTL: netAmount,
          barterBalance: 0,
          xpPoints: 0,
          xpAdsBalance: 0,
          xpTradeBalance: 0,
          xpCommissionBalance: 0,
        },
      });

      // b. Platform cüzdanına KOMİSYON aktar
      await tx.wallet.upsert({
        where: { userId: 'SYSTEM_PLATFORM_ACCOUNT' },
        update: { balanceTL: { increment: commissionAmount } },
        create: {
          userId: 'SYSTEM_PLATFORM_ACCOUNT',
          balanceTL: commissionAmount,
          barterBalance: 0,
          xpPoints: 0,
          xpAdsBalance: 0,
          xpTradeBalance: 0,
          xpCommissionBalance: 0,
        },
      });

      // 5. Durumları Güncelle
      await tx.escrow.update({
        where: { orderId },
        data: {
          status: 'RELEASED',
          releasedAt: escrowEntity.releasedAt,
          releasedAmount: netAmount, // Satıcıya giden net
          updatedAt: escrowEntity.updatedAt,
          payoutLog: {
            grossAmount: escrow.amount,
            commissionAmount: commissionAmount,
            netAmount: netAmount,
            vendorTier: vendorTier,
            commissionRate: commissionResult.rate
          }
        },
      });

      // 6. Muhasebe Kayıtları (General Ledger)
      // a. Escrow Release (Brüt)
      await tx.generalLedger.create({
        data: {
          type: 'ESCROW_RELEASE',
          debitAccountId: 'SYSTEM_ESCROW_ACCOUNT',
          creditAccountId: escrow.sellerId,
          amount: escrow.amount,
          referenceId: orderId,
          refType: 'ORDER',
          note: `Order ${orderId} emanet çözüldü (Brüt: ${escrow.amount})`,
        },
      });

      // b. Commission (Gelir)
      if (commissionAmount.gt(0)) {
        await tx.generalLedger.create({
          data: {
            type: 'COMMISSION',
            debitAccountId: escrow.sellerId,
            creditAccountId: 'SYSTEM_PLATFORM_ACCOUNT',
            amount: commissionAmount,
            referenceId: orderId,
            refType: 'ORDER',
            note: `Order ${orderId} komisyon kesintisi (%${commissionResult.rate})`,
          },
        });
      }

      // 7. Satıcı Ekstresi (Account Transaction)
      if (sellerMainAccount) {
        await tx.accountTransaction.create({
          data: {
            accountId: sellerMainAccount.id,
            type: 'RELEASE',
            direction: 'CREDIT',
            amount: netAmount,
            description: `Sipariş #${orderId} ödemesi (Komisyon kesildi: ${commissionAmount})`,
            referenceId: orderId,
            referenceType: 'ORDER',
            status: 'COMPLETED',
          },
        });

        await tx.account.update({
          where: { id: sellerMainAccount.id },
          data: {
            balance: { increment: netAmount },
            availableBalance: { increment: netAmount },
          },
        });
      }
    });
  }
}
