// apps/backend/src/modules/analytics/application/handlers/analytics-query.handlers.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetDashboardStatsQuery, GetAdminStatsQuery, GetVendorStatsQuery } from '../commands-queries/analytics.bus';
import { MongoAnalyticsRepository } from '../../infrastructure/persistence/mongo-analytics.repository';
import { AdminStatsDto } from '../dtos/admin-stats.dto';
import { VendorStatsDto } from '../dtos/vendor-stats.dto';

@QueryHandler(GetAdminStatsQuery)
export class GetAdminStatsHandler implements IQueryHandler<GetAdminStatsQuery> {
  constructor(private readonly repository: MongoAnalyticsRepository) {}
  async execute(query: GetAdminStatsQuery): Promise<AdminStatsDto> {
    return this.repository.getAdminStats();
  }
}
