import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetVendorProductsQuery } from './get-vendor-products.query';

@QueryHandler(GetVendorProductsQuery)
export class GetVendorProductsHandler implements IQueryHandler<GetVendorProductsQuery> {
  private readonly logger = new Logger(GetVendorProductsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetVendorProductsQuery) {
    const { userId, filters } = query;
    const { search, categoryId, limit = 100 } = filters;

    const vendor = await this.prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    const listings = await this.prisma.listing.findMany({
      where: {
        vendorId: vendor.id,
        AND: [
          search ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } }
            ]
          } : {},
          categoryId ? { catalogProduct: { categoryId } } : {}
        ]
      },
      include: {
        catalogProduct: {
          include: {
            category: true,
            media: {
              where: { type: 'IMAGE' },
              orderBy: { sortOrder: 'asc' }, // Bonus: Media sıralaması eklendi
              take: 1
            }
          }
        }
      },
      take: Number(limit),
      orderBy: { updatedAt: 'desc' }
    });

    // Frontend uyumu için 'Category' büyük harfle bırakıldı
    return listings.map(l => ({
      id: l.id,
      name: l.title,
      sku: l.sku,
      price: l.price,
      stock: l.stock,
      status: l.status,
      image: l.catalogProduct?.media?.[0]?.url,
      Category: l.catalogProduct?.category 
    }));
  }
}
