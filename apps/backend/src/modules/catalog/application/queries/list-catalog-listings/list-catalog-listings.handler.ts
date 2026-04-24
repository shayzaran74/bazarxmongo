import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ListCatalogListingsQuery } from './list-catalog-listings.query';

@QueryHandler(ListCatalogListingsQuery)
export class ListCatalogListingsHandler
  implements IQueryHandler<ListCatalogListingsQuery> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListCatalogListingsQuery) {
    const { userId, userRole, filters } = query;
    console.log('[ListCatalogListingsHandler] Executing for:', { userId, userRole, filters });
    
    const { search, page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    // VENDOR kendi ilanlarını görür, ADMIN tümünü görür
    const where: any = {};
    console.log('[ListCatalogListingsHandler] Initial where:', where);

    const isVendor = userRole === 'VENDOR' || (Array.isArray(userRole) && userRole.includes('VENDOR'));
    const isAdmin = userRole === 'ADMIN' || (Array.isArray(userRole) && userRole.includes('ADMIN'));
    
    const dbTotal = await this.prisma.listing.count();
    console.log('[ListCatalogListingsHandler] Absolute total in DB:', dbTotal);

    if (isVendor && !isAdmin) {
      const vendor = await this.prisma.vendor.findUnique({
        where: { userId }
      });
      if (vendor) {
        where.vendorId = vendor.id;
      } else {
        // Vendor bulunamadıysa hiçbir şey dönme (güvenlik için)
        where.vendorId = 'non-existent';
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        include: {
          catalogProduct: {
            include: {
              media: { take: 1, orderBy: { sortOrder: 'asc' } },
              category: true
            }
          },
          vendor: { include: { company: true } }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.listing.count({ where })
    ]);

    const mappedItems = items.map(l => ({
      id: l.id,
      name: l.title,
      price: l.price ? Number(l.price) : 0,
      stock: l.stock,
      sku: l.sku || '',
      status: l.status,
      images: l.catalogProduct?.media?.map(m => m.url) || [],
      category: l.catalogProduct?.category?.name,
      vendorName: l.vendor?.company?.name || 'Bilinmeyen Satıcı'
    }));

    console.log('[ListCatalogListingsHandler] Found items count:', items.length, 'Total:', total);

    return {
      items: mappedItems,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
