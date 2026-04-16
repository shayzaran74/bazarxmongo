// apps/backend/src/modules/analytics/domain/entities/analytics.entities.ts

import { Entity } from '@barterborsa/shared-core';
import { AnalyticsEventType, ActivityType } from '../enums/analytics.enums';

export interface AnalyticsEventProps {
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
  metadata?: any;
  timestamp: Date;
}

export class AnalyticsEvent extends Entity<AnalyticsEventProps> {
  private constructor(props: AnalyticsEventProps, id?: string) { super(props, id); }
  public static track(props: Omit<AnalyticsEventProps, 'timestamp'>, id?: string): AnalyticsEvent {
    return new AnalyticsEvent({ ...props, timestamp: new Date() }, id);
  }
}

export interface ProductActivityProps {
  type: ActivityType;
  userId?: string;
  listingId?: string;
  catalogProductId?: string;
  metadata?: any;
  createdAt: Date;
}

export class ProductActivity extends Entity<ProductActivityProps> {
  private constructor(props: ProductActivityProps, id?: string) { super(props, id); }
  public static track(props: Omit<ProductActivityProps, 'createdAt'>, id?: string): ProductActivity {
    return new ProductActivity({ ...props, createdAt: new Date() }, id);
  }
}
