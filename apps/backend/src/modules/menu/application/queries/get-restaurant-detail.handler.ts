import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetRestaurantDetailQuery } from './get-restaurant-detail.query';
import { SubscriptionPricingService } from '../../../subscription/application/services/subscription-pricing.service';

@QueryHandler(GetRestaurantDetailQuery)
export class GetRestaurantDetailHandler implements IQueryHandler<GetRestaurantDetailQuery> {
  constructor(
    private readonly prisma:   PrismaService,
    private readonly pricing:  SubscriptionPricingService,
  ) {}

  async execute(query: GetRestaurantDetailQuery) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where:   { id: query.restaurantId },
      include: {
        menus: {
          where:   { isActive: true },
          orderBy: { originalPrice: 'asc' },
        },
        launchPartner: true,
      },
    });

    if (!restaurant) throw new NotFoundException('Restoran bulunamadı');

    return {
      id:               restaurant.id,
      name:             restaurant.name,
      slug:             restaurant.slug,
      city:             restaurant.city,
      district:         restaurant.district,
      address:          restaurant.address,
      category:         restaurant.category,
      imageUrl:         restaurant.imageUrl,
      isLaunchPartner:  !!restaurant.launchPartner,
      menus: restaurant.menus.map((m) => {
        const breakdown = this.pricing.calculateMenuPrice(Number(m.originalPrice));
        return {
          id:              m.id,
          title:           m.title,
          description:     m.description,
          imageUrl:        m.imageUrl,
          originalPrice:   Number(m.originalPrice),
          discountedPrice: Number(m.discountedPrice),
          pricing:         breakdown,   // toplam ödeme, tasarruf
          dailyLimit:      m.dailyLimit,
          validFrom:       m.validFrom,
          validUntil:      m.validUntil,
        };
      }),
    };
  }
}
