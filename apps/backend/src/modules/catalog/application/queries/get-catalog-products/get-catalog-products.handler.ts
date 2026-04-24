import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetCatalogProductsQuery } from './get-catalog-products.query';

@QueryHandler(GetCatalogProductsQuery)
export class GetCatalogProductsHandler
  implements IQueryHandler<GetCatalogProductsQuery> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetCatalogProductsQuery) {
    const {
      search, categoryId,
      isFeatured, isSpecialOffer, isFlashSale,
      page = 1, limit = 20
    } = query.filters;

    const skip = (page - 1) * limit;

    const where: any = { status: 'ACTIVE' };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (categoryId) where.categoryId = categoryId;
    if (isFeatured === true) where.isFeatured = true;
    if (isSpecialOffer === true) where.isSpecialOffer = true;
    if (isFlashSale === true) where.isFlashSale = true;

    const [rawItems, total] = await Promise.all([
      this.prisma.catalogProduct.findMany({
        where,
        include: {
          category: true,
          media: { orderBy: { sortOrder: 'asc' } },
          listings: {
            where: { status: 'ACTIVE' },
            take: 1,
            orderBy: { price: 'asc' }
          },
          brands: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.catalogProduct.count({ where })
    ]);

    const items = rawItems.map(item => {
      const listing = item.listings?.[0] ?? null;
      return {
        ...item,
        rating: Number(item.rating), // Convert Decimal to number
        Brand: item.brands?.[0] ?? null,
        image: item.media?.[0]?.url ?? null,
        images: item.media?.map(m => m.url) ?? [],
        price: listing ? Number(listing.price) : 0,
        stock: listing?.stock ?? 0,
        sku: listing?.sku ?? '',
        isFeatured: item.isFeatured,
        isSpecialOffer: item.isSpecialOffer,
        isFlashSale: item.isFlashSale
      };
    });

    return {
      items,
      meta: { total, page, limit }
    };
  }
}
