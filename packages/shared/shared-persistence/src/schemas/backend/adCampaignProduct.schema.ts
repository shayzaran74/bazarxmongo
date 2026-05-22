import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// AdCampaignProduct — generated from Prisma schema
// TODO: strict typing — codegen

export interface IAdCampaignProduct {
  _id?: string;
  id: string;
  adCampaignId: string;
  listingId: string;
}

export const AdCampaignProductSchema = new Schema<IAdCampaignProduct>({
  _id: { type: String },
  id: { type: String, required: true },
  adCampaignId: { type: String, alias: 'ad_campaign_id' },
  listingId: { type: String, alias: 'listing_id' },
}, {
  timestamps: true,
  collection: 'ad_campaign_products',
});

// Unique constraint
AdCampaignProductSchema.index({ adCampaignId: 1, listingId: 1 }, { unique: true });

export const AdCampaignProduct = createModelProxy<IAdCampaignProduct>('AdCampaignProduct', AdCampaignProductSchema);
