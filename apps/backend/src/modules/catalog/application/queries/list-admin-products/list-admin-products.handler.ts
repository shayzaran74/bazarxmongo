import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ListAdminProductsQuery } from './list-admin-products.query';

@QueryHandler(ListAdminProductsQuery)
export class ListAdminProductsHandler
  implements IQueryHandler<ListAdminProductsQuery> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListAdminProductsQuery) {
    const { search, status, page = 1, limit = 50 } = query.filters;
    console.log('[AdminProducts] Filters:', { search, status, page, limit });
    const skip = Math.max(0, (page - 1) * limit);
    
    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' as const };
    }
    if (status) {
      where.listings = {
        some: { status: status }
      };
    }

    const [rawItems, total] = await Promise.all([
      this.prisma.catalogProduct.findMany({
        where,
        include: {
          category: true,
          media: { orderBy: { sortOrder: 'asc' } },
          listings: { 
            take: 1, 
            orderBy: { price: 'asc' },
            include: { 
              vendor: { 
                include: { 
                  company: true, 
                  profile: true 
                } 
              } 
            } 
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
        Brand: item.brands?.[0] ?? null,
        Category: item.category ?? null,
        Vendor: listing?.vendor ?? null,
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
