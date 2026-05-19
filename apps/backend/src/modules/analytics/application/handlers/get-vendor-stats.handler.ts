// apps/backend/src/modules/analytics/application/handlers/analytics-query.handlers.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetDashboardStatsQuery, GetAdminStatsQuery, GetVendorStatsQuery } from '../commands-queries/analytics.bus';
import { MongoAnalyticsRepository } from '../../infrastructure/persistence/mongo-analytics.repository';
import { AdminStatsDto } from '../dtos/admin-stats.dto';
import { VendorStatsDto } from '../dtos/vendor-stats.dto';

@QueryHandler(GetVendorStatsQuery)
export class GetVendorStatsHandler implements IQueryHandler<GetVendorStatsQuery> {
  constructor(private readonly repository: MongoAnalyticsRepository) {}
  async execute(query: GetVendorStatsQuery): Promise<VendorStatsDto> {
    return this.repository.getVendorStats(query.vendorId);
  }
}
