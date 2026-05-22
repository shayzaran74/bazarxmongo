import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// AdSlotToAdCampaign — generated from Prisma schema
// TODO: strict typing — codegen

export interface IAdSlotToAdCampaign {
  _id?: string;
  adSlotId: string;
  adCampaignId: string;
}

export const AdSlotToAdCampaignSchema = new Schema<IAdSlotToAdCampaign>({
  _id: { type: String },
  adSlotId: { type: String, alias: 'ad_slot_id' },
  adCampaignId: { type: String, alias: 'ad_campaign_id' },
}, {
  timestamps: true,
  collection: 'ad_slot_to_campaign',
});

export const AdSlotToAdCampaign = createModelProxy<IAdSlotToAdCampaign>('AdSlotToAdCampaign', AdSlotToAdCampaignSchema);
