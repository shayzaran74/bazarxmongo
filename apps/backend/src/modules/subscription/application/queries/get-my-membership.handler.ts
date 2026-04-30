import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetMyMembershipQuery } from './get-my-membership.query';
import { SubscriptionPricingService } from '../services/subscription-pricing.service';
import { SubscriptionTier, SUBSCRIPTION_FEES } from '../../../loyalty/domain/enums/loyalty.enums';

@QueryHandler(GetMyMembershipQuery)
export class GetMyMembershipHandler implements IQueryHandler<GetMyMembershipQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: SubscriptionPricingService,
  ) {}

  async execute(query: GetMyMembershipQuery) {
    const { userId } = query;

    const subscription = await this.prisma.userSubscription.findUnique({
      where:   { userId },
      include: { plan: true },
    });

    if (!subscription) return { hasSubscription: false };

    const tier = subscription.plan.tier as SubscriptionTier;

    // Bu ayki menü kullanımı
    const now   = new Date();
    const usage = await this.prisma.menuUsage.findUnique({
      where: { subscriptionId_month_year: {
        subscriptionId: subscription.id,
        month:          now.getMonth() + 1,
        year:           now.getFullYear(),
      }},
    });

    const totalCredit = this.pricing.getMonthlyMenuCredit(tier);
    const usedCredit  = usage ? Number(usage.usedCredit) : 0;

    // Ciro eşiği %80 uyarısı için son ay cirosunu çek
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const revenueResult = await this.prisma.order.aggregate({
      where: { userId, status: { in: ['COMPLETED', 'DELIVERED'] }, createdAt: { gte: oneMonthAgo } },
      _sum:  { totalAmount: true },
    });
    const monthlyRevenue  = Number(revenueResult._sum.totalAmount ?? 0);
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
        monthlyFee:              Number(subscription.plan.monthlyFee),
      },
      menuCredit: {
        total:     totalCredit,
        used:      usedCredit,
        remaining: totalCredit - usedCredit,
      },
      upgradeEligibility: {
        monthlyRevenue,
        revenueThreshold,
        revenueProgress,
        nearThreshold: revenueProgress >= 80 && revenueProgress < 100,
        eligible:      revenueProgress >= 100,
      },
    };
  }
}
