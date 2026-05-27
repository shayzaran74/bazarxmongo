// apps/backend/src/modules/analytics/infrastructure/persistence/mongo-analytics.repository.ts
// Analytics repository — Mongoose implementation (ADR-005 Faz 2c)

import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AnalyticsEvent, IAnalyticsEvent } from '@barterborsa/shared-persistence';
import { User } from '@barterborsa/shared-persistence/schemas/backend/user.schema';
import { Vendor } from '@barterborsa/shared-persistence/schemas/backend/vendor.schema';
import { Listing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';
import { Order } from '@barterborsa/shared-persistence/schemas/backend/order.schema';
import { AdminStatsDto } from '../../application/dtos/admin-stats.dto';
import { VendorStatsDto } from '../../application/dtos/vendor-stats.dto';

@Injectable()
export class MongoAnalyticsRepository {
  private readonly logger = new Logger(MongoAnalyticsRepository.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async trackEvent(event: Partial<IAnalyticsEvent>): Promise<void> {
    const id = `ae_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await AnalyticsEvent.create({
      _id: id,
      id,
      ...event,
      timestamp: event.timestamp || new Date(),
    });
  }

  async trackBatch(events: Partial<IAnalyticsEvent>[]): Promise<void> {
    const docs = events.map((event, idx) => {
      const id = `ae_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 9)}`;
      return {
        _id: id,
        id,
        ...event,
        timestamp: event.timestamp || new Date(),
      };
    });
    await AnalyticsEvent.insertMany(docs);
  }

  async getDashboardStats(startDate: Date): Promise<Record<string, unknown>> {
    const [totalEvents, productViews, cartAdds, checkouts] = await Promise.all([
      AnalyticsEvent.countDocuments({ timestamp: { $gte: startDate } }),
      AnalyticsEvent.countDocuments({ eventType: 'PRODUCT_VIEW', timestamp: { $gte: startDate } }),
      AnalyticsEvent.countDocuments({ eventType: 'CART_ADD', timestamp: { $gte: startDate } }),
      AnalyticsEvent.countDocuments({ eventType: 'CHECKOUT', timestamp: { $gte: startDate } }),
    ]);
    return { totalEvents, productViews, cartAdds, checkouts };
  }

  async getAdminStats(): Promise<AdminStatsDto> {
    const [totalUsers, pendingVendors, activeVendors, totalProducts, totalCategories, totalListings, totalOrders] = await Promise.all([
      User.countDocuments(),
      Vendor.countDocuments({ status: 'PENDING' }),
      Vendor.countDocuments({ status: 'APPROVED' }),
      Listing.countDocuments(),
      User.countDocuments(), // TODO: category count
      Listing.countDocuments(),
      Order.countDocuments(),
    ]);
    return {
      users: { total: totalUsers, newLast24h: 0, active: 0 },
      vendors: { total: totalUsers, pending: pendingVendors, active: activeVendors },
      catalog: { totalProducts, totalCategories, totalListings, totalAuctions: 0, totalLotteries: 0 },
      sales: { totalOrders, totalRevenue: 0, pendingOrders: 0 },
    };
  }

  async getVendorStats(vendorId: string): Promise<VendorStatsDto> {
    const [totalListings, activeListings, outOfStock, totalOrders] = await Promise.all([
      Listing.countDocuments({ vendorId }),
      Listing.countDocuments({ vendorId, status: 'ACTIVE' }),
      Listing.countDocuments({ vendorId, stock: 0 }),
      Order.countDocuments(),
    ]);
    return {
      products: { total: totalListings, active: activeListings, outOfStock },
      sales: { totalOrders, totalRevenue: 0, pendingOrders: 0, shippedOrders: 0 },
      customers: { totalFollowers: 0, reviewCount: 0, averageRating: 0 },
      performance: { returnRate: 0, cancellationRate: 0 },
    };
  }
}