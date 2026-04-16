// apps/backend/src/modules/analytics/infrastructure/persistence/prisma-analytics.repositories.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AnalyticsEvent, ProductActivity } from '../../domain/entities/analytics.entities';

@Injectable()
export class PrismaAnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    const data = { ...event.getProps(), id: event.id.toString() };
    await this.prisma.analyticsEvent.create({ data });
  }

  async trackBatch(events: AnalyticsEvent[]): Promise<void> {
    const data = events.map(e => ({ ...e.getProps(), id: e.id.toString() }));
    await this.prisma.analyticsEvent.createMany({ data });
  }

  async getDashboardStats(startDate: Date): Promise<any> {
    const count = await this.prisma.analyticsEvent.count({ where: { timestamp: { gte: startDate } } });
    return { totalEvents: count };
  }

  async getAdminStats(): Promise<any> {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      newUsers24h,
      totalVendors,
      pendingVendors,
      totalProducts,
      totalCategories,
      totalOrders,
      revenueResult,
      pendingOrders,
      totalAuctions,
      totalLotteries,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { createdAt: { gte: last24h } } }),
      this.prisma.vendor.count(),
      this.prisma.vendor.count({ where: { status: 'PENDING' } }),
      this.prisma.catalogProduct.count(),
      this.prisma.category.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({ _sum: { totalAmount: true } }),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.auction.count(),
      this.prisma.lottery.count(),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        newLast24h: newUsers24h,
      },
      vendors: {
        total: totalVendors,
        pending: pendingVendors,
        active: totalVendors - pendingVendors, // Basit mantık
      },
      catalog: {
        totalProducts,
        totalCategories,
        totalListings: await this.prisma.listing.count(),
        totalAuctions,
        totalLotteries,
      },
      sales: {
        totalOrders,
        totalRevenue: Number(revenueResult._sum.totalAmount || 0),
        pendingOrders,
      },
    };
  }

  async getVendorStats(vendorId: string): Promise<any> {
    const [
      totalListings,
      activeListings,
      outOfStockListings,
      totalOrders,
      revenueResult,
      pendingOrders,
      shippedOrders,
      followerCount,
      vendorData,
      totalUsers,
    ] = await Promise.all([
      this.prisma.listing.count({ where: { vendorId } }),
      this.prisma.listing.count({ where: { vendorId, status: 'ACTIVE' } }),
      this.prisma.listing.count({ where: { vendorId, status: 'OUT_OF_STOCK' } }),
      this.prisma.order.count({ where: { vendorId } }),
      this.prisma.order.aggregate({
        where: { vendorId, paymentStatus: 'COMPLETED' },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.count({ where: { vendorId, status: 'PENDING' } }),
      this.prisma.order.count({ where: { vendorId, status: 'SHIPPED' } }),
      this.prisma.vendorFollower.count({ where: { vendorId } }),
      this.prisma.vendorStats.findUnique({ where: { vendorId } }),
      this.prisma.order.groupBy({
        by: ['userId'],
        where: { vendorId },
      }).then(res => res.length),
    ]);

    return {
      products: {
        total: totalListings,
        active: activeListings,
        outOfStock: outOfStockListings,
      },
      sales: {
        totalOrders,
        totalRevenue: Number(revenueResult._sum?.totalAmount || 0),
        pendingOrders,
        shippedOrders,
      },
      customers: {
        totalFollowers: followerCount,
        totalUsers,
        reviewCount: vendorData?.reviewCount || 0,
        averageRating: Number(vendorData?.rating || 0),
      },
      performance: {
        returnRate: 0, // İleride hesaplanabilir
        cancellationRate: 0, // İleride hesaplanabilir
      },
    };
  }
}
