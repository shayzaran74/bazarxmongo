import { createModelProxy } from '../../mongodb/model-proxy';
// packages/shared/shared-persistence/src/schemas/backend/campaign.schema.ts
import { Schema, Types } from 'mongoose';

export interface ICampaign {
  _id?: string;
  id: string;
  name: string;
  description?: string;
  discountValue: Types.Decimal128;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const CampaignSchema = new Schema<ICampaign>({
  _id: { type: String },
  id: { type: String, required: true },
  name: { type: String },
  description: { type: String },
  discountValue: { type: Types.Decimal128 },
  startDate: { type: Date },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'campaigns',
});

CampaignSchema.index({ isActive: 1, startDate: 1 });

export const Campaign = createModelProxy<ICampaign>('Campaign', CampaignSchema);