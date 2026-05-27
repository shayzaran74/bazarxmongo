// apps/backend/src/modules/subscription/application/commands/upgrade-tier.handler.ts
// Master Plan v4.3 §2.7 — Tier yükseltme kuralları

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types, ClientSession } from 'mongoose';
import {
  IUserSubscription, IMembershipPlan, IReferral,
  IOrder, IUserLevel, IXpTransaction, ILoyaltyTierHistory,
} from '@barterborsa/shared-persistence';
import { UpgradeTierCommand } from './upgrade-tier.command';
import { SubscriptionPricingService } from '../services/subscription-pricing.service';
import { SubscriptionTier, SUBSCRIPTION_FEES } from '../../../loyalty/domain/enums/loyalty.enums';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { MenuRightsService } from '../../../menu/application/services/menu-rights.service';

@CommandHandler(UpgradeTierCommand)
export class UpgradeTierHandler implements ICommandHandler<UpgradeTierCommand> {
  private readonly logger = new Logger(UpgradeTierHandler.name);

  constructor(
    @InjectModel('UserSubscription')  private readonly subModel:         Model<IUserSubscription>,
    @InjectModel('MembershipPlan')    private readonly planModel:        Model<IMembershipPlan>,
    @InjectModel('Referral')          private readonly referralModel:    Model<IReferral>,
    @InjectModel('Order')             private readonly orderModel:       Model<IOrder>,
    @InjectModel('UserLevel')         private readonly userLevelModel:   Model<IUserLevel>,
    @InjectModel('XpTransaction')     private readonly xpTxModel:        Model<IXpTransaction>,
    @InjectModel('LoyaltyTierHistory')private readonly tierHistoryModel: Model<ILoyaltyTierHistory>,
    @InjectConnection()               private readonly connection:        Connection,
    private readonly pricing:   SubscriptionPricingService,
    private readonly auditLog:  AuditLogService,
    private readonly menuRights: MenuRightsService,
  ) {}

  async execute(command: UpgradeTierCommand) {
    const { userId, newTier, xpAmount } = command;

    const subscription = await this.subModel.findOne({ userId }).lean();
    if (!subscription || subscription.status !== 'ACTIVE') {
      throw new NotFoundException('Aktif abonelik bulunamadı');
    }

    const currentPlan = await this.planModel.findOne({ id: subscription.planId }).lean();
    if (!currentPlan) throw new NotFoundException('Mevcut plan bulunamadı');
    const currentTier = currentPlan.tier as SubscriptionTier;

    if (!this.pricing.isHigherTier(newTier, currentTier)) {
      throw new BadRequestException('Hedef kademe mevcut kademeden yüksek olmalıdır');
    }

    const referralCount = await this.referralModel.countDocuments({
      referrerId: userId, rewardGrantedAt: { $ne: null, $exists: true },
    });
    const hasThirdBonus = referralCount >= 3;

    const payment = this.pricing.calculateUpgradePayment(currentTier, newTier, hasThirdBonus);

    if (xpAmount > payment.xpAllowed) {
      throw new BadRequestException(
        `Maksimum ${payment.xpAllowed} XP kullanabilirsiniz (aidat farkının %${hasThirdBonus ? 60 : 50}'i)`,
      );
    }

    // Son 1 ay ciro kontrolü
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const completedOrders = await this.orderModel
      .find({ userId, status: { $in: ['COMPLETED', 'DELIVERED'] }, createdAt: { $gte: oneMonthAgo } }, { totalAmount: 1 })
      .lean();
    const monthlyRevenue = completedOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount.toString()), 0);

    if (!this.pricing.isRevenueEligible(monthlyRevenue, currentTier)) {
      const required = SUBSCRIPTION_FEES[currentTier] * 5;
      throw new BadRequestException(
        `Tier yükseltme için son 1 ayda en az ${required.toLocaleString('tr-TR')}₺ platform cirosu gerekli (mevcut: ${monthlyRevenue.toLocaleString('tr-TR')}₺)`,
      );
    }

    const newPlan = await this.planModel.findOne({ tier: newTier }).lean();
    if (!newPlan) throw new NotFoundException('Hedef plan bulunamadı');

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        await this.subModel.updateOne(
          { userId }, { $set: { planId: newPlan.id } }, { session },
        );

        if (xpAmount > 0) {
          await this.userLevelModel.updateOne(
            { userId }, { $inc: { currentXp: -xpAmount } }, { session },
          );
          const txId = new Types.ObjectId().toString();
          await this.xpTxModel.create(
            [{ _id: txId, id: txId, userId, amount: -xpAmount, type: 'SPEND',
               description: `Tier yükseltme: ${currentTier} → ${newTier}`, referenceType: 'SUBSCRIPTION_UPGRADE' }],
            { session },
          );
        }

        const histId = new Types.ObjectId().toString();
        await this.tierHistoryModel.create(
          [{ _id: histId, id: histId, userId, fromTier: currentTier, toTier: newTier, reason: 'MANUAL_UPGRADE' }],
          { session },
        );

        // Master Plan §2.2 — Yeni tier'a göre menü hakkını yeniden hesapla (aidat × 2).
        // Yükseltme (isDowngrade = false) → eski hak deaktive, yeni hak verilir.
        await this.menuRights.recalculateForTier(userId, newTier, false, session);
      });
    } finally {
      await session.endSession();
    }

    await this.auditLog.log({
      actorId: userId, action: 'SUBSCRIPTION_UPGRADED',
      resourceType: 'UserSubscription', resourceId: subscription.id,
      oldValue: { tier: currentTier },
      newValue: { tier: newTier, xpUsed: xpAmount, cashRequired: payment.cashRequired - xpAmount },
    });

    this.logger.log('Tier yükseltildi', { userId, from: currentTier, to: newTier });

    return {
      success: true,
      message: `${newTier} kademesine yükseltildi`,
      data:    { oldTier: currentTier, newTier, xpUsed: xpAmount, cashRequired: payment.cashRequired - xpAmount },
    };
  }
}
