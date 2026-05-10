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
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (categoryId) {
      // Find the target category first
      // Find the target category by ID or Slug
      const targetCategory = await this.prisma.category.findFirst({
        where: {
          OR: [
            { id: categoryId },
            { slug: categoryId }
          ]
        },
        select: { id: true }
      });

      if (targetCategory) {
        // Get all children IDs recursively
        const allCategoryIds = [targetCategory.id];
        let currentLevelIds = [targetCategory.id];

        while (currentLevelIds.length > 0) {
          const children = await this.prisma.category.findMany({
            where: { parentId: { in: currentLevelIds } },
            select: { id: true }
          });
          currentLevelIds = children.map(c => c.id);
          allCategoryIds.push(...currentLevelIds);
        }

        where.categoryId = { in: allCategoryIds };
      } else {
        // Fallback for non-existent category
        where.categoryId = categoryId; 
      }
    }
    if (query.filters.brandId) {
      where.brands = { some: { id: query.filters.brandId } };
    }
    if (query.filters.minPrice !== undefined || query.filters.maxPrice !== undefined) {
      const { minPrice, maxPrice } = query.filters;
      where.listings = {
        some: {
          status: 'ACTIVE',
          price: {
            ...(minPrice !== undefined && { gte: Number(minPrice) }),
            ...(maxPrice !== undefined && { lte: Number(maxPrice) })
          }
        }
      };
    }
    
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
        listingId: listing?.id ?? null,
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
