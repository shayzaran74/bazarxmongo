// apps/backend/src/modules/menu/application/queries/get-launch-partners.handler.ts
// BazarX Go: LaunchPartner.restaurantId → vendorId

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import type { Prisma } from '@prisma/client';
import { GetLaunchPartnersQuery } from './get-launch-partners.query';

@QueryHandler(GetLaunchPartnersQuery)
export class GetLaunchPartnersHandler implements IQueryHandler<GetLaunchPartnersQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetLaunchPartnersQuery) {
    const { phase, city, page = 1, limit = 20 } = query.filters;
    const skip = (page - 1) * limit;

    const where: Prisma.LaunchPartnerWhereInput = {
      ...(phase ? { phase: phase as 'PHASE_1' | 'PHASE_2' | 'PHASE_3' } : {}),
      ...(city
        ? { vendor: { profile: { city: { contains: city, mode: 'insensitive' } } } }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.launchPartner.findMany({
        where,
        skip,
        take: limit,
        include: {
          vendor: {
            select: {
              id:      true,
              profile: { select: { storeName: true, city: true, district: true } },
            },
          },
        },
        orderBy: { startDate: 'desc' },
      }),
      this.prisma.launchPartner.count({ where }),
    ]);

    return {
      items: items.map((lp) => ({
        id: lp.id,
        restaurant: {
          id:       lp.vendor.id,
          name:     lp.vendor.profile?.storeName ?? '',
          city:     lp.vendor.profile?.city ?? null,
          district: lp.vendor.profile?.district ?? null,
        },
        phase:            lp.phase,
        pledgedMenuCount: lp.pledgedMenuCount,
        distributedCount: lp.distributedCount,
        remainingMenus:   lp.pledgedMenuCount - lp.distributedCount,
        progressPct:      Math.round((lp.distributedCount / lp.pledgedMenuCount) * 100),
        freeAdMonths:     lp.freeAdMonths,
        adMonthsUsed:     lp.adMonthsUsed,
        startDate:        lp.startDate,
        phase2StartDate:  lp.phase2StartDate,
        phase3StartDate:  lp.phase3StartDate,
      })),
      total,
      page,
      limit,
    };
  }
}
