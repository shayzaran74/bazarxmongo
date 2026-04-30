import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetLaunchPartnersQuery } from './get-launch-partners.query';

@QueryHandler(GetLaunchPartnersQuery)
export class GetLaunchPartnersHandler implements IQueryHandler<GetLaunchPartnersQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetLaunchPartnersQuery) {
    const { phase, city, page = 1, limit = 20 } = query.filters;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.launchPartner.findMany({
        where: {
          ...(phase ? { phase: phase as 'PHASE_1' | 'PHASE_2' | 'PHASE_3' } : {}),
          ...(city  ? { restaurant: { city: { contains: city, mode: 'insensitive' } } } : {}),
        },
        skip,
        take: limit,
        include: {
          restaurant: {
            select: { id: true, name: true, city: true, district: true, category: true },
          },
        },
        orderBy: { startDate: 'desc' },
      }),
      this.prisma.launchPartner.count({
        where: {
          ...(phase ? { phase: phase as 'PHASE_1' | 'PHASE_2' | 'PHASE_3' } : {}),
        },
      }),
    ]);

    return {
      items: items.map((lp) => ({
        id:               lp.id,
        restaurant:       lp.restaurant,
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
