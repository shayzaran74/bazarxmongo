// apps/backend/src/modules/analytics/infrastructure/persistence/prisma-analytics.repositories.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AnalyticsEvent, ProductActivity } from '../../domain/entities/analytics.entities';

@Injectable()
export class PrismaAnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    const data = { ...event.getProps(), id: event.id.toString() };
    await this.prisma.analyticsEvent.create({ data });
  }

  async trackBatch(events: AnalyticsEvent[]): Promise<void> {
    const data = events.map(e => ({ ...e.getProps(), id: e.id.toString() }));
    await this.prisma.analyticsEvent.createMany({ data });
  }

  async getDashboardStats(startDate: Date): Promise<any> {
    const count = await this.prisma.analyticsEvent.count({ where: { timestamp: { gte: startDate } } });
    // Detailed stats aggregation can be complex, providing a basic summary for now
    return { totalEvents: count };
  }
}
