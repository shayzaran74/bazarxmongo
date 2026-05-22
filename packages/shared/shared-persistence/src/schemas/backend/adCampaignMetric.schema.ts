import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// AdCampaignMetric — generated from Prisma schema
// TODO: strict typing — codegen

export interface IAdCampaignMetric {
  _id?: string;
  id: string;
  adCampaignId: string;
  date: Date;
  impressions: number;
  clicks: number;
  ctr: Types.Decimal128;
  spend: Types.Decimal128;
  sales: number;
}

export const AdCampaignMetricSchema = new Schema<IAdCampaignMetric>({
  _id: { type: String },
  id: { type: String, required: true },
  adCampaignId: { type: String, alias: 'ad_campaign_id' },
  date: { type: Date },
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  ctr: { type: Types.Decimal128, default: 0 },
  spend: { type: Types.Decimal128, default: 0 },
  sales: { type: Number, default: 0 },
}, {
  timestamps: true,
  collection: 'ad_campaign_metrics',
});

// Composite index
AdCampaignMetricSchema.index({ date: 1 });

export const AdCampaignMetric = createModelProxy<IAdCampaignMetric>('AdCampaignMetric', AdCampaignMetricSchema);
