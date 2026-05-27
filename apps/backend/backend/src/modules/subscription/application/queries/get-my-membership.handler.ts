// apps/backend/src/modules/subscription/application/queries/get-my-membership.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  IUserSubscription, IMembershipPlan, IMenuUsage, IOrder,
} from '@barterborsa/shared-persistence';
import { GetMyMembershipQuery } from './get-my-membership.query';
import { SubscriptionPricingService } from '../services/subscription-pricing.service';
import { SubscriptionTier, SUBSCRIPTION_FEES } from '../../../loyalty/domain/enums/loyalty.enums';

@QueryHandler(GetMyMembershipQuery)
export class GetMyMembershipHandler implements IQueryHandler<GetMyMembershipQuery> {
  constructor(
    @InjectModel('UserSubscription') private readonly subModel:    Model<IUserSubscription>,
    @InjectModel('MembershipPlan')   private readonly planModel:   Model<IMembershipPlan>,
    @InjectModel('MenuUsage')        private readonly usageModel:  Model<IMenuUsage>,
    @InjectModel('Order')            private readonly orderModel:  Model<IOrder>,
    private readonly pricing: SubscriptionPricingService,
  ) {}

  async execute(query: GetMyMembershipQuery) {
    const { userId } = query;

    const subscription = await this.subModel.findOne({ userId }).lean();
    if (!subscription) return { hasSubscription: false };

    const plan = await this.planModel.findOne({ id: subscription.planId }).lean();
    if (!plan) return { hasSubscription: false };

    const tier = plan.tier as SubscriptionTier;
    const now  = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();

    const usage = await this.usageModel
      .findOne({ subscriptionId: subscription.id, month, year })
      .lean();

    const totalCredit = this.pricing.getMonthlyMenuCredit(tier);
    const usedCredit  = usage ? parseFloat(usage.usedCredit.toString()) : 0;

    // Son ay sipariş cirosu
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const completedOrders = await this.orderModel
      .find({ userId, status: { $in: ['COMPLETED', 'DELIVERED'] }, createdAt: { $gte: oneMonthAgo } }, { totalAmount: 1 })
      .lean();
    const monthlyRevenue  = completedOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount.toString()), 0);
    const revenueThreshold = SUBSCRIPTION_FEES[tier] * 5;
    const revenueProgress  = Math.min(100, Math.round((monthlyRevenue / revenueThreshold) * 100));

    return {
      hasSubscription: true,
      subscription: {
        id:                      subscription.id,
        tier,
        status:                  subscription.status,
        startDate:               subscription.startDate,
        endDate:                 subscription.endDate,
        autoRenew:               subscription.autoRenew,
        nextBillingDate:         subscription.nextBillingDate,
        downgradeProtectedUntil: subscription.downgradeProtectedUntil,
        monthlyFee:              parseFloat(plan.monthlyFee.toString()),
      },
      menuCredit: { total: totalCredit, used: usedCredit, remaining: totalCredit - usedCredit },
      upgradeEligibility: {
        monthlyRevenue, revenueThreshold, revenueProgress,
        nearThreshold: revenueProgress >= 80 && revenueProgress < 100,
        eligible:      revenueProgress >= 100,
      },
    };
  }
}
