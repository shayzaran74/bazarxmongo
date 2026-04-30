import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { BrowseRestaurantsQuery } from './browse-restaurants.query';
import { Prisma } from '@prisma/client';

@QueryHandler(BrowseRestaurantsQuery)
export class BrowseRestaurantsHandler implements IQueryHandler<BrowseRestaurantsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: BrowseRestaurantsQuery) {
    const { city, district, category, search, page = 1, limit = 20 } = query.filters;
    const skip = (page - 1) * limit;

    const where: Prisma.RestaurantWhereInput = { isActive: true };
    if (city)     where.city     = { contains: city,     mode: 'insensitive' };
    if (district) where.district = { contains: district, mode: 'insensitive' };
    if (category) where.category = { contains: category, mode: 'insensitive' };
    if (search)   where.name     = { contains: search,   mode: 'insensitive' };

    const [items, total] = await Promise.all([
      this.prisma.restaurant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          menus: {
            where:   { isActive: true },
            take:    1,
            orderBy: { originalPrice: 'asc' },
            select: { id: true, title: true, originalPrice: true, discountedPrice: true, imageUrl: true },
          },
          launchPartner: { select: { phase: true } },
        },
      }),
      this.prisma.restaurant.count({ where }),
    ]);

    return {
      items: items.map((r) => ({
        id:               r.id,
        name:             r.name,
        slug:             r.slug,
        city:             r.city,
        district:         r.district,
        category:         r.category,
        imageUrl:         r.imageUrl,
        averageMenuPrice: r.averageMenuPrice ? Number(r.averageMenuPrice) : null,
        isLaunchPartner:  !!r.launchPartner,
        featuredMenu:     r.menus[0] ?? null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
