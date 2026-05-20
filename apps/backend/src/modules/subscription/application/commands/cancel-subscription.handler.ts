// apps/backend/src/modules/subscription/application/commands/cancel-subscription.handler.ts
// §4 — Erken İptal Cezası: 16. günden önce iptal → fark tutarı geri talep edilir

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IUserSubscription, IMembershipPlan, IMenuPurchase } from '@barterborsa/shared-persistence';
import { CancelSubscriptionCommand } from './cancel-subscription.command';

const ACTIVATION_DAYS = 15; // §4 — 16. günde aktive olur

@CommandHandler(CancelSubscriptionCommand)
export class CancelSubscriptionHandler implements ICommandHandler<CancelSubscriptionCommand> {
  private readonly logger = new Logger(CancelSubscriptionHandler.name);

  constructor(
    @InjectModel('UserSubscription') private readonly subModel:     Model<IUserSubscription>,
    @InjectModel('MembershipPlan')   private readonly planModel:    Model<IMembershipPlan>,
    @InjectModel('MenuPurchase')     private readonly purchaseModel:Model<IMenuPurchase>,
  ) {}

  async execute(command: CancelSubscriptionCommand) {
    const { userId } = command;

    const subscription = await this.subModel.findOne({ userId }).lean();
    if (!subscription || subscription.status !== 'ACTIVE') {
      throw new NotFoundException('Aktif abonelik bulunamadı');
    }

    const now           = new Date();
    const startDate     = new Date(subscription.startDate);
    const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const isEarlyCancel = daysSinceStart < ACTIVATION_DAYS;

    // §4 Erken İptal Cezası — 16. günden önce iptal
    if (isEarlyCancel) {
      const plan = await this.planModel.findOne({ id: subscription.planId }).lean();
      const monthlyFee  = parseFloat((plan?.monthlyFee as unknown as { toString(): string })?.toString() ?? '0');
      const menuCredit  = monthlyFee * 2; // aidat × 2 = menü hakkı
      const penaltyAmount = menuCredit - monthlyFee; // fark = platform zararı

      // Bu dönemdeki satın alınan menüleri CANCELLED olarak işaretle
      const cancelledPurchases = await this.purchaseModel.updateMany(
        { userId, subscriptionId: subscription.id, status: { $in: ['ACTIVE', 'PARTIALLY_REDEEMED'] } },
        { $set: { status: 'CANCELLED' } },
      );

      this.logger.warn('Erken iptal cezası uygulandı', {
        userId, daysSinceStart, penaltyAmount, cancelledPurchases: cancelledPurchases.modifiedCount,
      });

      // Ceza ödenmeden iptal edilemez — 402 döndür (frontend bunu ödeme akışına yönlendirir)
      throw new BadRequestException({
        code:           'EARLY_CANCEL_PENALTY',
        message:        'Üyeliğinizi henüz aktive edilmeden iptal etmek istiyorsunuz.',
        daysSinceStart,
        activationDay:  ACTIVATION_DAYS + 1,
        penaltyAmount,
        description:    `${penaltyAmount.toLocaleString('tr-TR')} ₺ erken iptal bedeli ödemeniz gerekmektedir. ` +
                        'Bu ücret, aldığınız menü hakkı ile ödediğiniz aidat arasındaki farkı karşılar.',
      });
    }

    // Normal iptal — 30 gün downgrade koruması
    const protectedUntil = new Date(subscription.endDate ?? now);
    protectedUntil.setDate(protectedUntil.getDate() + 30);

    await this.subModel.updateOne(
      { userId },
      { $set: { status: 'CANCELLED', autoRenew: false, cancelledAt: now, downgradeProtectedUntil: protectedUntil } },
    );

    return {
      success: true,
      message: 'Abonelik iptal edildi. Menü haklarınız 30 gün daha geçerlidir.',
      data:    { protectedUntil },
    };
  }
}
