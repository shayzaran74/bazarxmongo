import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetVendorAnalyticsQuery } from './get-vendor-analytics.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { IOrderRepository } from '../../../commerce/domain/repositories/order.repository.interface';

@QueryHandler(GetVendorAnalyticsQuery)
export class GetVendorAnalyticsHandler implements IQueryHandler<GetVendorAnalyticsQuery> {
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    @Inject('IOrderRepository') private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(query: GetVendorAnalyticsQuery) {
    const { userId, period } = query;

    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) return null;

    const vendorId = vendor.id;

    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const result = await this.orderRepo.findAllFiltered({ vendorId, limit: 0 });

    // Basitleştirilmiş analytics — groupBy Prisma'ya özel
    const filtered = result.items.filter(o => o.createdAt >= since);

    const completedItems = filtered.filter(o =>
      ['COMPLETED', 'DELIVERED'].includes(o.getProps().status)
    );

    const totalOrders = filtered.length;
    const totalRevenue = completedItems.reduce((sum: number, o) =>
      sum + Number(o.getProps().totalAmount ?? 0), 0
    );

    return {
      period,
      totalOrders,
      totalRevenue,
      topProducts: [],
      revenueByDay: [],
    };
  }
}
