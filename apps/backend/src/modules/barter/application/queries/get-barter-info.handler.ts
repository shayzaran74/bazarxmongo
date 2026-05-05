// apps/backend/src/modules/barter/application/queries/get-barter-info.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetBarterInfoQuery } from './get-barter-info.query';
import { PrismaService } from '@barterborsa/shared-persistence';

@QueryHandler(GetBarterInfoQuery)
export class GetBarterInfoHandler implements IQueryHandler<GetBarterInfoQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetBarterInfoQuery) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId: query.userId },
      include: {
        company: { select: { id: true, name: true } },
        metrics: { select: { totalRevenue: true } },
        stats:   { select: { rating: true, reviewCount: true, loyaltyPoints: true, trustScore: true } },
      },
    });

    return {
      isRegistered: !!vendor,
      vendorId:     vendor?.id,
      companyId:    vendor?.company?.id,
      companyName:  vendor?.company?.name,
      tier:         vendor?.tier || 'CORE',
      rating:       Number(vendor?.stats?.rating || 0),
      trustScore:   Number(vendor?.stats?.trustScore || 100),
      loyaltyPoints: vendor?.stats?.loyaltyPoints || 0,
      balance:      0, // financial-gateway'den gelecek
    };
  }
}
