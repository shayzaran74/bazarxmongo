import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ListAdminProductsQuery } from './list-admin-products.query';

@QueryHandler(ListAdminProductsQuery)
export class ListAdminProductsHandler
  implements IQueryHandler<ListAdminProductsQuery> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListAdminProductsQuery) {
    const { search, status, page = 1, limit = 50, vendorOnly } = query.filters;
    const vendorId = query.filters.vendorId;
    const categoryId = query.filters.categoryId;
    const skip = Math.max(0, (page - 1) * limit);
    
    const conditions: any[] = [];

    // Arama: İsim, SKU veya ilan başlığı üzerinden
    if (search) {
      conditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { gtin: { contains: search, mode: 'insensitive' as const } },
          { listings: { some: { sku: { contains: search, mode: 'insensitive' as const } } } },
          { listings: { some: { title: { contains: search, mode: 'insensitive' as const } } } },
        ]
      });
    }

    // Kategori filtresi
    if (categoryId) {
      conditions.push({ categoryId });
    }

    // Belirli bir satıcıya göre filtre
    if (vendorId) {
      conditions.push({
        listings: { some: { vendorId } }
      });
    }

    // Statü filtresi (PENDING, ACTIVE vb.)
    if (status) {
      conditions.push({
        listings: { some: { status: status as any } }
      });
    }

    // "Satıcı Ürünlerini Göster" — en az bir ilanı olan ürünler
    if (vendorOnly && !vendorId) {
      conditions.push({
        listings: { some: {} }
      });
    }

    const where: any = conditions.length > 0 ? { AND: conditions } : {};

    const [rawItems, total] = await Promise.all([
      this.prisma.catalogProduct.findMany({
        where,
        include: {
          category: true,
          media: { orderBy: { sortOrder: 'asc' } },
          listings: { 
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
      // Tüm ilanlardaki stokları topla
      const totalStock = item.listings?.reduce((sum, l) => {
        const qty = Number(l.availableQuantity) || Number(l.stock) || 0;
        return sum + qty;
      }, 0) ?? 0;
      return {
        ...item,
        Brand: item.brands?.[0] ?? null,
        Category: item.category ?? null,
        Vendor: listing?.vendor ?? null,
        image: item.media?.[0]?.url ?? null,
        images: item.media?.map(m => m.url) ?? [],
        price: listing ? listing.price : 0,
        stock: totalStock,
        sku: listing?.sku ?? ''
      };
    });

    return { items, total, page, limit };
  }
}
