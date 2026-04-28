// apps/backend/src/modules/vendor/application/queries/get-vendor-dashboard.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetVendorDashboardQuery } from './get-vendor-dashboard.query';

@QueryHandler(GetVendorDashboardQuery)
export class GetVendorDashboardHandler
  implements IQueryHandler<GetVendorDashboardQuery>
{
  private readonly logger = new Logger(GetVendorDashboardHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetVendorDashboardQuery) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: query.userId },
      include: {
        stats:   true,
        metrics: true,
      },
    });

    if (!vendor) throw new NotFoundException('Satıcı hesabı bulunamadı');

    // Paralel sorgular — performans için
    const [
      activeListingCount,
      pendingOrderCount,
      recentOrders,
      monthlyRevenue,
    ] = await Promise.all([
      this.prisma.listing.count({
        where: { vendorId: vendor.id, status: 'ACTIVE' },
      }),

      this.prisma.order.count({
        where: { vendorId: vendor.id, status: 'PENDING' },
      }),

      this.prisma.order.findMany({
        where: { vendorId: vendor.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id:          true,
          status:      true,
          totalAmount: true,
          currency:    true,
          createdAt:   true,
        },
      }),

      this.prisma.order.aggregate({
        where: {
          vendorId:  vendor.id,
          status:    { in: ['COMPLETED', 'DELIVERED'] },
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
        _sum: { totalAmount: true },
      }),
    ]);

    const stats   = vendor.stats;
    const metrics = vendor.metrics;

    return {
      vendor: {
        id:     vendor.id,
        tier:   vendor.tier,
        status: vendor.status,
      },
      summary: {
        activeListingCount,
        pendingOrderCount,
        totalRevenue:    Number(metrics?.totalRevenue   ?? 0),
        monthlyRevenue:  Number(monthlyRevenue._sum.totalAmount ?? 0),
        orderCount:      metrics?.monthlyOrderCount ?? 0,
        rating:          Number(stats?.rating       ?? 0),
        reviewCount:     stats?.reviewCount         ?? 0,
        trustScore:      Number(stats?.trustScore   ?? 100),
        loyaltyPoints:   stats?.loyaltyPoints       ?? 0,
      },
      recentActivity: recentOrders,
      stats: {
        returnRate:          Number(metrics?.returnRate          ?? 0),
        avgResponseTimeMins: Number(metrics?.avgResponseTimeMins ?? 0),
        adBudgetSpent:       Number(metrics?.adBudgetSpent       ?? 0),
        lastCalculatedAt:    metrics?.lastCalculatedAt,
      },
    };
  }
}
