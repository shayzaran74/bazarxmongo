// apps/backend/src/modules/subscription/application/commands/subscribe-user.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { SubscribeUserCommand } from './subscribe-user.command';
import { SubscriptionPricingService } from '../services/subscription-pricing.service';
import { SUBSCRIPTION_FEES } from '../../../loyalty/domain/enums/loyalty.enums';
import { AuditLogService } from '../../../audit/application/audit-log.service';

@CommandHandler(SubscribeUserCommand)
export class SubscribeUserHandler implements ICommandHandler<SubscribeUserCommand> {
  private readonly logger = new Logger(SubscribeUserHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: SubscriptionPricingService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: SubscribeUserCommand) {
    const { userId, tier, annual } = command;

    // Mevcut abonelik kontrolü
    const existing = await this.prisma.userSubscription.findUnique({
      where: { userId },
    });
    if (existing?.status === 'ACTIVE') {
      throw new BadRequestException('Aktif aboneliğiniz var. Yükseltmek için upgrade endpoint\'ini kullanın.');
    }

    const plan = await this.prisma.membershipPlan.findUnique({
      where: { tier },
    });
    if (!plan || !plan.isActive) {
      throw new BadRequestException('Geçersiz abonelik planı');
    }

    const monthlyFee = Number(plan.monthlyFee);
    const fee        = annual && plan.annualFee ? Number(plan.annualFee) : monthlyFee;
    const months     = annual ? 12 : 1;

    const startDate = new Date();
    const endDate   = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);

    const nextBillingDate = annual ? endDate : new Date(startDate);
    if (!annual) nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    const subscription = await this.prisma.userSubscription.create({
      data: {
        userId,
        planId:          plan.id,
        status:          'ACTIVE',
        startDate,
        endDate,
        autoRenew:       true,
        nextBillingDate,
      },
    });

    this.logger.log('Yeni abonelik oluşturuldu', { userId, tier, fee });

    await this.auditLog.log({
      actorId:      userId,
      action:       'SUBSCRIPTION_CREATED',
      resourceType: 'UserSubscription',
      resourceId:   subscription.id,
      newValue:     { tier, fee, annual, startDate, endDate },
    });

    return {
      success: true,
      message: `${tier} aboneliği başlatıldı`,
      data: {
        subscriptionId:  subscription.id,
        tier,
        fee,
        startDate,
        endDate,
        menuCredit:      Number(plan.menuCredit),
      },
    };
  }
}
