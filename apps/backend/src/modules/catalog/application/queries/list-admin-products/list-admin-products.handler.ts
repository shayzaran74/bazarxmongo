import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ListAdminProductsQuery } from './list-admin-products.query';

@QueryHandler(ListAdminProductsQuery)
export class ListAdminProductsHandler
  implements IQueryHandler<ListAdminProductsQuery> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListAdminProductsQuery) {
    const { search, page = 1, limit = 50 } = query.filters;
    const skip = Math.max(0, (page - 1) * limit);
    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {};

    const [rawItems, total] = await Promise.all([
      this.prisma.catalogProduct.findMany({
        where,
        include: {
          category: true,
          media: { orderBy: { sortOrder: 'asc' } },
          listings: { take: 1, orderBy: { price: 'asc' } },
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
        Brand: item.brands?.[0] ?? null,
        image: item.media?.[0]?.url ?? null,
        images: item.media?.map(m => m.url) ?? [],
        price: listing ? listing.price : 0,
        stock: listing?.stock ?? 0,
        sku: listing?.sku ?? ''
      };
    });

    return { items, total, page, limit };
  }
}
