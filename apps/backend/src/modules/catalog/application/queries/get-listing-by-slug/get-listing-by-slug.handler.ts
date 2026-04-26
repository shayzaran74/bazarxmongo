import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetListingBySlugQuery } from './get-listing-by-slug.query';

@QueryHandler(GetListingBySlugQuery)
export class GetListingBySlugHandler
  implements IQueryHandler<GetListingBySlugQuery> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetListingBySlugQuery) {
    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query.slug) || /^c[^\s-]{8,}$/i.test(query.slug);

    const listing = await this.prisma.listing.findFirst({
      where: isId ? { id: query.slug } : { slug: query.slug },
      include: {
        catalogProduct: {
          include: {
            media: { orderBy: { sortOrder: 'asc' } },
            category: true,
            brands: true
          }
        },
        vendor: {
          include: { company: true, profile: true }
        }
      }
    });

    // Bulunamazsa null döner, 404 fırlatmaz (Frontend logic korunuyor)
    return listing ?? null;
  }
}
