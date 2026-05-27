// apps/backend/src/modules/analytics/application/handlers/analytics-query.handlers.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetDashboardStatsQuery, GetAdminStatsQuery, GetVendorStatsQuery } from '../commands-queries/analytics.bus';
import { MongoAnalyticsRepository } from '../../infrastructure/persistence/mongo-analytics.repository';

@QueryHandler(GetDashboardStatsQuery)
export class GetDashboardStatsHandler implements IQueryHandler<GetDashboardStatsQuery> {
  constructor(private readonly repository: MongoAnalyticsRepository) {}
  async execute(query: GetDashboardStatsQuery) {
    const startDate = new Date();
    if (query.period === 'week') startDate.setDate(startDate.getDate() - 7);
    if (query.period === 'month') startDate.setDate(startDate.getDate() - 30);
    return this.repository.getDashboardStats(startDate);
  }
}

@QueryHandler(GetAdminStatsQuery)
export class GetAdminStatsHandler implements IQueryHandler<GetAdminStatsQuery> {
  constructor(private readonly repository: MongoAnalyticsRepository) {}
  async execute(query: GetAdminStatsQuery) {
    return this.repository.getAdminStats();
  }
}

@QueryHandler(GetVendorStatsQuery)
export class GetVendorStatsHandler implements IQueryHandler<GetVendorStatsQuery> {
  constructor(private readonly repository: MongoAnalyticsRepository) {}
  async execute(query: GetVendorStatsQuery) {
    return this.repository.getVendorStats(query.vendorId);
  }
}
