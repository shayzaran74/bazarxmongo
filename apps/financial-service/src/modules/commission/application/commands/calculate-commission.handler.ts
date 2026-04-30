// apps/financial-service/src/modules/commission/application/commands/calculate-commission.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CalculateCommissionCommand } from './calculate-commission.command';
import { CommissionCalculatorService } from '../../domain/services/commission-calculator.service';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@CommandHandler(CalculateCommissionCommand)
export class CalculateCommissionHandler implements ICommandHandler<CalculateCommissionCommand> {
  constructor(
    private readonly calculator: CommissionCalculatorService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: CalculateCommissionCommand): Promise<void> {
    const { vendorId, vendorTier, amount, type, referenceId, referenceType } = command;

    // 1. Komisyon hesapla (saf domain mantığı — yan etkisiz)
    const { rate, commission } = this.calculator.calculateSimple(amount, vendorTier);

    const currency = type === 'CASH' ? 'TRY' : 'BARTER';

    // Komisyon kaydı + platform cüzdan kredisi + muhasebe kaydı tek transaction içinde.
    // Herhangi bir adım başarısız olursa komisyon kaydı da geri alınır.
    await this.prisma.$transaction(async (tx) => {
      // Mükerrer işlem kontrolü
      const existing = await tx.commissionRecord.findFirst({
        where: {
          ...(referenceType === 'ORDER'
            ? { orderId: referenceId }
            : { tradeOfferId: referenceId }),
          status: 'COLLECTED',
        },
      });
      if (existing) return;

      const now = new Date();

      // 2. Komisyon kaydını oluştur ve direkt topla (CALCULATED→COLLECTED tek seferde)
      await tx.commissionRecord.create({
        data: {
          vendorId,
          vendorTier,
          baseAmount: amount,
          commissionRate: rate,
          commissionAmount: commission,
          commissionType: type,
          orderId: referenceType === 'ORDER' ? referenceId : null,
          tradeOfferId: referenceType === 'TRADE' ? referenceId : null,
          status: 'COLLECTED',
          createdAt: now,
          collectedAt: now,
        },
      });

      // 3. Platform komisyon cüzdanına yansıt (sadece TRY destekleniyor)
      if (currency === 'TRY') {
        await tx.wallet.upsert({
          where: { userId: 'SYSTEM_PLATFORM_ACCOUNT' },
          update: { balanceTL: { increment: commission } },
          create: {
            userId: 'SYSTEM_PLATFORM_ACCOUNT',
            balanceTL: commission,
            barterBalance: 0,
            xpPoints: 0,
            xpAdsBalance: 0,
            xpTradeBalance: 0,
            xpCommissionBalance: 0,
          },
        });
      }

      // 4. Muhasebe kaydı (General Ledger)
      await tx.generalLedger.create({
        data: {
          type: 'COMMISSION',
          debitAccountId: vendorId,
          creditAccountId: 'SYSTEM_PLATFORM_ACCOUNT',
          amount: commission,
          referenceId: `commission_${referenceType}_${referenceId}`,
          refType: referenceType,
          note: `Komisyon tahsilatı — Tier: ${vendorTier}, Oran: %${rate}`,
        },
      });
    });
  }
}
