import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema } from 'mongoose';

export const EventCategory = ['PRODUCT','CART','CHECKOUT','BARTER','SUBSCRIPTION','TRUST','VENDOR'] as const;
export type EventCategoryType = typeof EventCategory[number];

export interface IAnalyticsEvent {
  _id?: string;
  id: string;
  eventType: string;
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
  id: { type: String, required: true },
  eventType: { type: String },
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

AnalyticsEventSchema.index({ eventType: 1, timestamp: -1 });
AnalyticsEventSchema.index({ userId: 1, timestamp: -1 });
AnalyticsEventSchema.index({ vendorId: 1, timestamp: -1 });
AnalyticsEventSchema.index({ listingId: 1 });
AnalyticsEventSchema.index({ sessionId: 1 });

export const AnalyticsEvent = createModelProxy<IAnalyticsEvent>('AnalyticsEvent', AnalyticsEventSchema);