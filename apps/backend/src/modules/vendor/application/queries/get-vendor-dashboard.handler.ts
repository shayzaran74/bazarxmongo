// apps/backend/src/modules/vendor/application/queries/get-vendor-dashboard.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException, Inject } from '@nestjs/common';
import { GetVendorDashboardQuery } from './get-vendor-dashboard.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { IListingRepository } from '../../../catalog/domain/repositories/listing.repository.interface';
import { IOrderRepository } from '../../../commerce/domain/repositories/order.repository.interface';
import { VendorStats } from '@barterborsa/shared-persistence/schemas/backend/vendorStats.schema';
import { VendorMetrics } from '@barterborsa/shared-persistence/schemas/backend/vendorMetrics.schema';

@QueryHandler(GetVendorDashboardQuery)
export class GetVendorDashboardHandler
  implements IQueryHandler<GetVendorDashboardQuery>
{
  private readonly logger = new Logger(GetVendorDashboardHandler.name);

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    @Inject('IListingRepository') private readonly listingRepo: IListingRepository,
    @Inject('IOrderRepository') private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(query: GetVendorDashboardQuery) {
    const vendor = await this.vendorRepo.findByUserId(query.userId);
    if (!vendor) throw new NotFoundException('Satıcı hesabı bulunamadı');

    const vendorProps = vendor.getProps();
    const vendorId = (vendorProps as any).id || vendor.id;

    // VendorStats ve VendorMetrics ayrı sorgular
    const [statsDoc, metricsDoc] = await Promise.all([
      VendorStats.findOne({ vendorId }).exec(),
      VendorMetrics.findOne({ vendorId }).exec(),
    ]);

    const [
      activeListingCount,
      pendingOrderCount,
      recentOrdersResult,
      monthlyRevenueResult,
    ] = await Promise.all([
      this.listingRepo.search({ vendorId, status: 'ACTIVE', take: 1 }),
      this.orderRepo.findAllFiltered({ vendorId, status: 'PENDING', limit: 0 }),
      this.orderRepo.findAllFiltered({ vendorId, limit: 5 }),
      this.orderRepo.findAllFiltered({
        vendorId,
        status: 'COMPLETED',
        skip: 0,
        limit: 0,
      }),
    ]);

    // Aylık gelir için aggregate (Order'da date filter yok, manuel hesapla)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const allOrdersResult = await this.orderRepo.findAllFiltered({ vendorId, limit: 0 });
    const monthlyOrders = allOrdersResult.items.filter((o: any) => {
      const createdAt = new Date((o as any).createdAt || (o as any).props?.createdAt);
      return createdAt >= monthStart && ['COMPLETED', 'DELIVERED'].includes((o as any).status || (o as any).props?.status);
    });
    const monthlyRevenue = monthlyOrders.reduce((sum: number, o: any) => {
      const amount = Number((o as any).totalAmount ?? (o as any).props?.totalAmount ?? 0);
      return sum + amount;
    }, 0);

    const stats = statsDoc ? statsDoc.toObject() : null;
    const metrics = metricsDoc ? metricsDoc.toObject() : null;

    const recentOrders = recentOrdersResult.items.map((o: any) => {
      const p = o.getProps ? o.getProps() : o;
      return {
        id:          (p as any).id || (o as any).id,
        status:      (p as any).status || (o as any).status,
        totalAmount: Number((p as any).totalAmount ?? 0),
        currency:    (p as any).currency || 'TRY',
        createdAt:   (p as any).createdAt || (o as any).createdAt,
      };
    });

    return {
      vendor: {
        id:     vendorId,
        tier:   (vendorProps as any).tier,
        status: (vendorProps as any).status,
      },
      summary: {
        activeListingCount: activeListingCount.total,
        pendingOrderCount:  pendingOrderCount.total,
        totalRevenue:    Number(metrics?.totalRevenue   ?? 0),
        monthlyRevenue,
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
