import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ListVendorProductsQuery } from './list-vendor-products.query';

@QueryHandler(ListVendorProductsQuery)
export class ListVendorProductsHandler
  implements IQueryHandler<ListVendorProductsQuery> {
  private readonly logger = new Logger(ListVendorProductsHandler.name);
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListVendorProductsQuery) {
    const { userId, filters } = query;
    const { search, page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const where: any = { vendorId: vendor.id };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        include: {
          images: { take: 1 },
          catalogProduct: {
            select: { id: true, name: true, gtin: true, brand: true }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.listing.count({ where })
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
