// apps/backend/src/modules/analytics/application/commands-queries/analytics.bus.ts

import { Command, Query } from '@barterborsa/shared-core';

export class TrackEventCommand extends Command {
  constructor(public readonly event: any) { super(); }
}

export class TrackBatchEventsCommand extends Command {
  constructor(public readonly events: any[]) { super(); }
}

export class GetDashboardStatsQuery extends Query {
  constructor(public readonly period: 'day' | 'week' | 'month' = 'day') { super(); }
}

export class GetProductAnalyticsQuery extends Query {
  constructor(public readonly listingId: string) { super(); }
}

export class GetRevenueReportQuery extends Query {
  constructor(public readonly startDate: Date, public readonly endDate: Date) { super(); }
}
