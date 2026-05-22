import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// AdLocation — generated from Prisma schema
// TODO: strict typing — codegen

export interface IAdLocation {
  _id?: string;
  id: string;
  tag: string;
  adCampaignId?: string;
  createdAt: Date;
  homeBannerId?: string;
  sideAdId?: string;
  updatedAt: Date;
}

export const AdLocationSchema = new Schema<IAdLocation>({
  _id: { type: String },
  id: { type: String, required: true },
  tag: { type: String },
  adCampaignId: { type: String, alias: 'ad_campaign_id' },
  createdAt: { type: Date, alias: 'created_at' },
  homeBannerId: { type: String, alias: 'home_banner_id' },
  sideAdId: { type: String, alias: 'side_ad_id' },
  updatedAt: { type: Date, alias: 'updated_at' },
}, {
  timestamps: true,
  collection: 'ad_locations',
});

// Composite index
AdLocationSchema.index({ tag: 1 });

// Unique constraint
AdLocationSchema.index({ homeBannerId: 1, tag: 1 }, { unique: true });

// Unique constraint
AdLocationSchema.index({ sideAdId: 1, tag: 1 }, { unique: true });

// Unique constraint
AdLocationSchema.index({ adCampaignId: 1, tag: 1 }, { unique: true });

export const AdLocation = createModelProxy<IAdLocation>('AdLocation', AdLocationSchema);
