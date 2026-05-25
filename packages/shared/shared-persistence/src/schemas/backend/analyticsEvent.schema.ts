// packages/shared/shared-persistence/src/schemas/backend/analyticsEvent.schema.ts

import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema } from 'mongoose';

export const EventCategory = ['PRODUCT', 'CART', 'CHECKOUT', 'BARTER', 'SUBSCRIPTION', 'TRUST', 'VENDOR'] as const;
export type EventCategoryType = typeof EventCategory[number];

// AnalyticsEventType enum — tek kaynak, analytics modülü domain ile paylaşılır
export enum AnalyticsEventType {
  PAGE_VIEW = 'PAGE_VIEW',
  PRODUCT_VIEW = 'PRODUCT_VIEW',
  SEARCH = 'SEARCH',
  ADD_TO_CART = 'ADD_TO_CART',
  REMOVE_FROM_CART = 'REMOVE_FROM_CART',
  CART_ADD = 'CART_ADD',
  CHECKOUT_START = 'CHECKOUT_START',
  CHECKOUT = 'CHECKOUT',
  PURCHASE = 'PURCHASE',
  QR_SCAN = 'QR_SCAN',
  QR_VIEW = 'QR_VIEW',
}

export interface IAnalyticsEvent {
  _id?: string;
  eventType: AnalyticsEventType;
  category: EventCategoryType;
  timestamp: Date;
  userId?: string;
  vendorId?: string;
  listingId?: string;
  sessionId?: string;
  referrer?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  path?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export const AnalyticsEventSchema = new Schema<IAnalyticsEvent>({
  _id: { type: String },
  eventType: { type: String, enum: Object.values(AnalyticsEventType), required: true },
  category: { type: String, enum: EventCategory },
  timestamp: { type: Date },
  userId: { type: String },
  vendorId: { type: String },
  listingId: { type: String },
  sessionId: { type: String },
  referrer: { type: String },
  source: { type: String },
  medium: { type: String },
  campaign: { type: String },
  path: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date },
}, {
  timestamps: true,
  collection: 'analytics_events',
});

// TTL index — 90 gün sonra otomatik silinme
AnalyticsEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
AnalyticsEventSchema.index({ eventType: 1, timestamp: -1 });
AnalyticsEventSchema.index({ userId: 1, timestamp: -1 });
AnalyticsEventSchema.index({ vendorId: 1, timestamp: -1 });
AnalyticsEventSchema.index({ listingId: 1, timestamp: -1 });
AnalyticsEventSchema.index({ sessionId: 1 });

export const AnalyticsEvent = createModelProxy<IAnalyticsEvent>('AnalyticsEvent', AnalyticsEventSchema);