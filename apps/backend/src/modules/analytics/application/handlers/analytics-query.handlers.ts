// apps/backend/src/modules/analytics/application/handlers/analytics-query.handlers.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetDashboardStatsQuery } from '../commands-queries/analytics.bus';
import { PrismaAnalyticsRepository } from '../../infrastructure/persistence/prisma-analytics.repositories';

@QueryHandler(GetDashboardStatsQuery)
export class GetDashboardStatsHandler implements IQueryHandler<GetDashboardStatsQuery> {
  constructor(private readonly repository: PrismaAnalyticsRepository) {}
  async execute(query: GetDashboardStatsQuery) {
    const startDate = new Date();
    if (query.period === 'week') startDate.setDate(startDate.getDate() - 7);
    if (query.period === 'month') startDate.setDate(startDate.getDate() - 30);
    return this.repository.getDashboardStats(startDate);
  }
}
