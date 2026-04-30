import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ListVendorBannersQuery } from './list-vendor-banners.query';

@QueryHandler(ListVendorBannersQuery)
export class ListVendorBannersHandler implements IQueryHandler<ListVendorBannersQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListVendorBannersQuery) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId: query.userId },
      select: { id: true },
    });
    if (!vendor) return [];

    return this.prisma.vendorBanner.findMany({
      where: { vendorId: vendor.id },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }
}
