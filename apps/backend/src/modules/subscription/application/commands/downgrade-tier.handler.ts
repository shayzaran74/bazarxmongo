// apps/backend/src/modules/subscription/application/commands/downgrade-tier.handler.ts
// Master Plan v4.3 §2.7 — Tier düşürme kuralları:
//   - Plan değişir.
//   - Eski menü hakları 30 gün daha geçerli kalır (DOWNGRADE_GRACE).
//   - Yeni tier'a göre yeni menü hakkı paralel olarak verilir.

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import {
  IUserSubscription, IMembershipPlan, ILoyaltyTierHistory,
} from '@barterborsa/shared-persistence';
import { DowngradeTierCommand } from './downgrade-tier.command';
import { SubscriptionPricingService } from '../services/subscription-pricing.service';
import { SubscriptionTier } from '../../../loyalty/domain/enums/loyalty.enums';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { MenuRightsService } from '../../../menu/application/services/menu-rights.service';

@CommandHandler(DowngradeTierCommand)
export class DowngradeTierHandler implements ICommandHandler<DowngradeTierCommand> {
  private readonly logger = new Logger(DowngradeTierHandler.name);

  constructor(
    @InjectModel('UserSubscription')   private readonly subModel:         Model<IUserSubscription>,
    @InjectModel('MembershipPlan')     private readonly planModel:        Model<IMembershipPlan>,
    @InjectModel('LoyaltyTierHistory') private readonly tierHistoryModel: Model<ILoyaltyTierHistory>,
    @InjectConnection()                private readonly connection:       Connection,
    private readonly pricing:    SubscriptionPricingService,
    private readonly auditLog:   AuditLogService,
    private readonly menuRights: MenuRightsService,
  ) {}

  async execute(command: DowngradeTierCommand) {
    const { userId, newTier, reason } = command;

    const subscription = await this.subModel.findOne({ userId }).lean();
    if (!subscription || subscription.status !== 'ACTIVE') {
      throw new NotFoundException('Aktif abonelik bulunamadı');
    }

    const currentPlan = await this.planModel.findOne({ id: subscription.planId }).lean();
    if (!currentPlan) throw new NotFoundException('Mevcut plan bulunamadı');
    const currentTier = currentPlan.tier as SubscriptionTier;

    // Sadece daha alt tier'a düşürme — yükseltme buradan yapılmaz
    if (this.pricing.isHigherTier(newTier, currentTier) || newTier === currentTier) {
      throw new BadRequestException('Hedef kademe mevcut kademeden düşük olmalıdır');
    }

    const newPlan = await this.planModel.findOne({ tier: newTier }).lean();
    if (!newPlan) throw new NotFoundException('Hedef plan bulunamadı');

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        await this.subModel.updateOne(
          { userId }, { $set: { planId: newPlan.id } }, { session },
        );

        const histId = new Types.ObjectId().toString();
        await this.tierHistoryModel.create(
          [{ _id: histId, id: histId, userId, fromTier: currentTier, toTier: newTier, reason: `DOWNGRADE_${reason}` }],
          { session },
        );

        // Master Plan §2.7 — Eski hak 30 gün korunur (isDowngrade = true).
        // recalculateForTier eski hakları DOWNGRADE_GRACE'e çevirir ve yeni hak verir.
        await this.menuRights.recalculateForTier(userId, newTier, true, session);
      });
    } finally {
      await session.endSession();
    }

    await this.auditLog.log({
      actorId: userId, action: 'SUBSCRIPTION_DOWNGRADED',
      resourceType: 'UserSubscription', resourceId: subscription.id,
      oldValue: { tier: currentTier },
      newValue: { tier: newTier, reason },
    });

    this.logger.log('Tier düşürüldü', { userId, from: currentTier, to: newTier, reason });

    return {
      success: true,
      message: `${newTier} kademesine düşürüldü — mevcut menü hakkı 30 gün daha geçerli.`,
      data: { oldTier: currentTier, newTier, gracePeriodDays: 30 },
    };
  }
}
