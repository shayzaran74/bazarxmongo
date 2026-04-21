import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetVendorDashboardQuery } from './get-vendor-dashboard.query';

@QueryHandler(GetVendorDashboardQuery)
export class GetVendorDashboardHandler implements IQueryHandler<GetVendorDashboardQuery> {
  private readonly logger = new Logger(GetVendorDashboardHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetVendorDashboardQuery) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: query.userId }
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    const productCount = await this.prisma.listing.count({
      where: { vendorId: vendor.id }
    });

    // TODO: VendorMetrics ve VendorStats entegrasyonu
    // şu an mock değerler dönüyor — mevcut davranış korunuyor
    return {
      totalSales: 0,
      orderCount: 0,
      productCount,
      recentActivity: [],
      stats: {
        views: 0,
        conversions: 0
      }
    };
  }
}
