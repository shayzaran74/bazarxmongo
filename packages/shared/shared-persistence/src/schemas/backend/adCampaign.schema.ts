import { createModelProxy } from '../../mongodb/model-proxy';
// packages/shared/shared-persistence/src/schemas/backend/adCampaign.schema.ts
import { Schema, Types } from 'mongoose';

export const AdCampaignStatus = ['PENDING','ACTIVE','PAUSED','REJECTED','COMPLETED','EXPIRED'] as const;
export type AdCampaignStatusType = typeof AdCampaignStatus[number];

export const AdType = ['BANNER','SPONSORED_PRODUCT','SEARCH_AD','SIDE_AD','VIDEO','REWARD_DISTRIBUTION','SAMPLING','SEARCH','DISPLAY','SOCIAL','RETARGETING'] as const;
export type AdTypeType = typeof AdType[number];

export interface IAdCampaign {
  _id?: string;
  id: string;
  name: string;
  vendorId?: string;
  creatorId?: string;
  budget: Types.Decimal128;
  bidAmount: Types.Decimal128;
  remainingBudget: Types.Decimal128;
  startDate: Date;
  endDate: Date;
  imageUrl?: string;
  linkUrl?: string;
  targetUrl?: string;
  mediaUrl?: string;
  adStatus: AdCampaignStatusType;
  adType: AdTypeType;
  platform?: string;
  qualityScore?: Types.Decimal128;
  historicCTR?: Types.Decimal128;
  maxBidPerClick?: Types.Decimal128;
  maxBidPerMille?: Types.Decimal128;
  rejectionReason?: string;
  targetCategories?: string[];
  targetKeywords?: string[];
  targetCities?: string[];
  targetDistricts?: string[];
  targetSlots?: string[];
  negativeKeywords?: string[];
  metadata?: Schema.Types.Mixed;
  createdAt: Date;
  updatedAt: Date;
}

export const AdCampaignSchema = new Schema<IAdCampaign>({
  _id: { type: String },
  id: { type: String, required: true },
  name: { type: String },
  vendorId: { type: String },
  creatorId: { type: String },
  budget: { type: Types.Decimal128 },
  bidAmount: { type: Types.Decimal128 },
  remainingBudget: { type: Types.Decimal128 },
  startDate: { type: Date },
  endDate: { type: Date },
  imageUrl: { type: String },
  linkUrl: { type: String },
  targetUrl: { type: String },
  mediaUrl: { type: String },
  adStatus: { type: String, enum: AdCampaignStatus, default: 'PENDING' },
  adType: { type: String, enum: AdType },
  platform: { type: String },
  qualityScore: { type: Types.Decimal128 },
  historicCTR: { type: Types.Decimal128 },
  maxBidPerClick: { type: Types.Decimal128 },
  maxBidPerMille: { type: Types.Decimal128 },
  rejectionReason: { type: String },
  targetCategories: { type: [String], default: [] },
  targetKeywords: { type: [String], default: [] },
  targetCities: { type: [String], default: [] },
  targetDistricts: { type: [String], default: [] },
  targetSlots: { type: [String], default: [] },
  negativeKeywords: { type: [String], default: [] },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'ad_campaigns',
});

AdCampaignSchema.index({ adStatus: 1 });
AdCampaignSchema.index({ adType: 1 });
AdCampaignSchema.index({ platform: 1 });
AdCampaignSchema.index({ vendorId: 1 });

export const AdCampaign = createModelProxy<IAdCampaign>('AdCampaign', AdCampaignSchema);