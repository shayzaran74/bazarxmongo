import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetCatalogProductBySlugQuery } from './get-catalog-product-by-slug.query';

@QueryHandler(GetCatalogProductBySlugQuery)
export class GetCatalogProductBySlugHandler
  implements IQueryHandler<GetCatalogProductBySlugQuery> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetCatalogProductBySlugQuery) {
    const { idOrSlug } = query;

    // UUID ise id ile, değilse slug ile ara
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      .test(idOrSlug);

    const rawProduct = await this.prisma.catalogProduct.findUnique({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
      include: {
        category: true,
        media: { orderBy: { sortOrder: 'asc' } },
        listings: { include: { vendor: true } },
        brands: true,
        catalogModel: true,
        productType: true
      }
    });

    if (!rawProduct) return null;

    const listing = rawProduct.listings?.[0] ?? null;

    return {
      ...rawProduct,
      Brand: rawProduct.brands?.[0] ?? null,
      Vendor: listing?.vendor ?? null,
      price: listing ? Number(listing.price) : 0,
      listingId: listing?.id ?? null,
      stock: listing?.stock ?? 0,
      sku: listing?.sku ?? '',
      image: rawProduct.media?.[0]?.url ?? null,
      images: rawProduct.media?.map(m => m.url) ?? []
    };
  }
}
