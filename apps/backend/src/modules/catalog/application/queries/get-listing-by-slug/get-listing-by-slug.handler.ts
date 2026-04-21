import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetListingBySlugQuery } from './get-listing-by-slug.query';

@QueryHandler(GetListingBySlugQuery)
export class GetListingBySlugHandler
  implements IQueryHandler<GetListingBySlugQuery> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetListingBySlugQuery) {
    const listing = await this.prisma.listing.findUnique({
      where: { slug: query.slug },
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
