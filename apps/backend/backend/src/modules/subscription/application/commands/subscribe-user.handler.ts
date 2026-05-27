// apps/backend/src/modules/subscription/application/commands/subscribe-user.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IUserSubscription, IMembershipPlan } from '@barterborsa/shared-persistence';
import { SubscribeUserCommand } from './subscribe-user.command';
import { SubscriptionPricingService } from '../services/subscription-pricing.service';
import { SUBSCRIPTION_FEES } from '../../../loyalty/domain/enums/loyalty.enums';
import { AuditLogService } from '../../../audit/application/audit-log.service';

@CommandHandler(SubscribeUserCommand)
export class SubscribeUserHandler implements ICommandHandler<SubscribeUserCommand> {
  private readonly logger = new Logger(SubscribeUserHandler.name);

  constructor(
    @InjectModel('UserSubscription') private readonly subModel:  Model<IUserSubscription>,
    @InjectModel('MembershipPlan')   private readonly planModel: Model<IMembershipPlan>,
    private readonly pricing:   SubscriptionPricingService,
    private readonly auditLog:  AuditLogService,
  ) {}

  async execute(command: SubscribeUserCommand) {
    const { userId, tier, annual } = command;

    const existing = await this.subModel.findOne({ userId }).lean();
    if (existing?.status === 'ACTIVE') {
      throw new BadRequestException("Aktif aboneliğiniz var. Yükseltmek için upgrade endpoint'ini kullanın.");
    }

    const plan = await this.planModel.findOne({ tier }).lean();
    if (!plan || !plan.isActive) throw new BadRequestException('Geçersiz abonelik planı');

    const monthlyFee = parseFloat(plan.monthlyFee.toString());
    const fee        = annual && plan.annualFee ? parseFloat(plan.annualFee.toString()) : monthlyFee;
    const months     = annual ? 12 : 1;

    const startDate = new Date();
    const endDate   = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);

    const nextBillingDate = annual ? new Date(endDate) : new Date(startDate);
    if (!annual) nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    const newId = new Types.ObjectId().toString();
    await this.subModel.create([{
      _id: newId, id: newId, userId, planId: plan.id,
      status: 'ACTIVE', startDate, endDate, autoRenew: true, nextBillingDate,
    }]);

    this.logger.log('Yeni abonelik oluşturuldu', { userId, tier, fee });

    await this.auditLog.log({
      actorId: userId, action: 'SUBSCRIPTION_CREATED',
      resourceType: 'UserSubscription', resourceId: newId,
      newValue: { tier, fee, annual, startDate, endDate },
    });

    return {
      success: true,
      message: `${tier} aboneliği başlatıldı`,
      data: {
        subscriptionId: newId, tier, fee, startDate, endDate,
        menuCredit: parseFloat(plan.menuCredit.toString()),
      },
    };
  }
}
