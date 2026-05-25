// apps/backend/src/modules/analytics/application/commands-queries/analytics.bus.ts

import { Command, Query } from '@barterborsa/shared-core';
import { AnalyticsEventType } from '@barterborsa/shared-persistence';

export class TrackEventCommand extends Command {
  constructor(public readonly event: TrackEventInput) { super(); }
}

export class TrackBatchEventsCommand extends Command {
  constructor(public readonly events: TrackEventInput[]) { super(); }
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

export class GetAdminStatsQuery extends Query {
  constructor() { super(); }
}

export class GetVendorStatsQuery extends Query {
  constructor(public readonly vendorId: string) { super(); }
}

export interface TrackEventInput {
  eventType: AnalyticsEventType;
  userId?: string;
  sessionId?: string;
  path?: string;
  ipAddress?: string;
  userAgent?: string;
  listingId?: string;
  catalogProductId?: string;
  categoryId?: string;
  vendorId?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
  intent?: string;
  eventSource?: string;
  metadata?: Record<string, unknown>;
  timestamp?: Date;
}