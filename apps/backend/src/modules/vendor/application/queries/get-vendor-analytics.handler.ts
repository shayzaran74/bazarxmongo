import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetVendorAnalyticsQuery } from './get-vendor-analytics.query';

@QueryHandler(GetVendorAnalyticsQuery)
export class GetVendorAnalyticsHandler implements IQueryHandler<GetVendorAnalyticsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetVendorAnalyticsQuery) {
    const { userId, period } = query;

    const vendor = await this.prisma.vendor.findFirst({
      where: { userId },
      select: { id: true },
    });
    if (!vendor) return null;

    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [orderStats, topProducts, revenueByDay] = await Promise.all([
      this.prisma.order.aggregate({
        where: {
          vendorId:  vendor.id,
          createdAt: { gte: since },
          status:    { in: ['COMPLETED', 'DELIVERED', 'PENDING'] },
        },
        _count: { id: true },
        _sum:   { totalAmount: true },
      }),

      this.prisma.orderItem.groupBy({
        by: ['productName'],
        where: { order: { vendorId: vendor.id, createdAt: { gte: since } } },
        _sum:   { quantity: true, totalAmount: true },
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: 5,
      }),

      this.prisma.order.groupBy({
        by: ['createdAt'],
        where: {
          vendorId:  vendor.id,
          createdAt: { gte: since },
          status:    { in: ['COMPLETED', 'DELIVERED'] },
        },
        _sum: { totalAmount: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    return {
      period,
      totalOrders:  orderStats._count.id,
      totalRevenue: Number(orderStats._sum.totalAmount ?? 0),
      topProducts:  topProducts.map((p) => ({
        name:     p.productName,
        quantity: p._sum.quantity,
        revenue:  Number(p._sum.totalAmount ?? 0),
      })),
      revenueByDay: revenueByDay.map((r) => ({
        date:    r.createdAt,
        revenue: Number(r._sum.totalAmount ?? 0),
      })),
    };
  }
}
