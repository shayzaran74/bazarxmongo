import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ListVendorBrandsQuery } from './list-vendor-brands.query';

@QueryHandler(ListVendorBrandsQuery)
export class ListVendorBrandsHandler implements IQueryHandler<ListVendorBrandsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListVendorBrandsQuery) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId: query.userId },
      select: { id: true },
    });
    if (!vendor) return [];

    return this.prisma.brand.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
