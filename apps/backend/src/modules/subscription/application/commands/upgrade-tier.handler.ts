// apps/backend/src/modules/subscription/application/commands/upgrade-tier.handler.ts
// Master Plan v4.3 §2.7 — Tier yükseltme kuralları

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { UpgradeTierCommand } from './upgrade-tier.command';
import { SubscriptionPricingService } from '../services/subscription-pricing.service';
import { SubscriptionTier, SUBSCRIPTION_FEES } from '../../../loyalty/domain/enums/loyalty.enums';
import { AuditLogService } from '../../../audit/application/audit-log.service';

@CommandHandler(UpgradeTierCommand)
export class UpgradeTierHandler implements ICommandHandler<UpgradeTierCommand> {
  private readonly logger = new Logger(UpgradeTierHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: SubscriptionPricingService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: UpgradeTierCommand) {
    const { userId, newTier, xpAmount } = command;

    const subscription = await this.prisma.userSubscription.findUnique({
      where: { userId },
      include: { plan: true },
    });
    if (!subscription || subscription.status !== 'ACTIVE') {
      throw new NotFoundException('Aktif abonelik bulunamadı');
    }

    const currentTier = subscription.plan.tier as SubscriptionTier;

    if (!this.pricing.isHigherTier(newTier, currentTier)) {
      throw new BadRequestException('Hedef kademe mevcut kademeden yüksek olmalıdır');
    }

    // 3. referans bonusu var mı?
    const referralCount = await this.prisma.referral.count({
      where: { referrerId: userId, rewardGrantedAt: { not: null } },
    });
    const hasThirdBonus = referralCount >= 3;

    // Ödeme bölüşümü hesapla
    const payment = this.pricing.calculateUpgradePayment(currentTier, newTier, hasThirdBonus);

    // XP miktarı izin verilen maksimumu aşıyor mu?
    if (xpAmount > payment.xpAllowed) {
      throw new BadRequestException(
        `Maksimum ${payment.xpAllowed} XP kullanabilirsiniz (aidat farkının %${hasThirdBonus ? 60 : 50}'i)`,
      );
    }

    // Son 1 ayda platform cirosunu kontrol et (5× mevcut aidat eşiği)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const revenueResult = await this.prisma.order.aggregate({
      where: {
        userId,
        status:    { in: ['COMPLETED', 'DELIVERED'] },
        createdAt: { gte: oneMonthAgo },
      },
      _sum: { totalAmount: true },
    });

    const monthlyRevenue = Number(revenueResult._sum.totalAmount ?? 0);

    if (!this.pricing.isRevenueEligible(monthlyRevenue, currentTier)) {
      const required = SUBSCRIPTION_FEES[currentTier] * 5;
      throw new BadRequestException(
        `Tier yükseltme için son 1 ayda en az ${required.toLocaleString('tr-TR')}₺ platform cirosu gerekli (mevcut: ${monthlyRevenue.toLocaleString('tr-TR')}₺)`,
      );
    }

    const newPlan = await this.prisma.membershipPlan.findUnique({ where: { tier: newTier } });
    if (!newPlan) throw new NotFoundException('Hedef plan bulunamadı');

    const oldTier = currentTier;

    await this.prisma.$transaction(async (tx) => {
      // Aboneliği güncelle
      await tx.userSubscription.update({
        where: { userId },
        data:  { planId: newPlan.id },
      });

      // XP kullanımı
      if (xpAmount > 0) {
        await tx.userLevel.update({
          where:  { userId },
          data:   { currentXp: { decrement: xpAmount } },
        });
        await tx.xpTransaction.create({
          data: {
            userId,
            amount:        -xpAmount,
            type:          'SPEND',
            description:   `Tier yükseltme: ${currentTier} → ${newTier}`,
            referenceType: 'SUBSCRIPTION_UPGRADE',
          },
        });
      }

      // Tier geçiş geçmişi
      await tx.loyaltyTierHistory.create({
        data: { userId, fromTier: oldTier, toTier: newTier, reason: 'MANUAL_UPGRADE' },
      });
    });

    await this.auditLog.log({
      actorId:      userId,
      action:       'SUBSCRIPTION_UPGRADED',
      resourceType: 'UserSubscription',
      resourceId:   subscription.id,
      oldValue:     { tier: oldTier },
      newValue:     { tier: newTier, xpUsed: xpAmount, cashRequired: payment.cashRequired - xpAmount },
    });

    this.logger.log('Tier yükseltildi', { userId, from: oldTier, to: newTier });

    return {
      success: true,
      message: `${newTier} kademesine yükseltildi`,
      data: { oldTier, newTier, xpUsed: xpAmount, cashRequired: payment.cashRequired - xpAmount },
    };
  }
}
