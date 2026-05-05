// apps/backend/src/modules/catalog/application/queries/get-product-stats.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProductStatsQuery } from './get-product-stats.query';
import { PrismaService } from '@barterborsa/shared-persistence';

@QueryHandler(GetProductStatsQuery)
export class GetProductStatsHandler implements IQueryHandler<GetProductStatsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const [total, active, pending] = await Promise.all([
      this.prisma.catalogProduct.count(),
      this.prisma.listing.count({ where: { status: 'ACTIVE' } }),
      this.prisma.listing.count({ where: { status: 'PENDING' } }),
    ]);

    return { total, active, pending };
  }
}
