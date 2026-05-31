// packages/shared/shared-persistence/src/schemas/backend/goCampaign.schema.ts

import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema } from 'mongoose';

export interface IGoCampaign {
  _id?: string;
  id: string;
  tag: string;
  title: string;
  sub: string;
  emoji: string;
  ribbon: string;
  g1: string;
  g2: string;
  validText: string;
  conditions: string;
  restaurantIds: string[];
  couponCode?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const GoCampaignSchema = new Schema<IGoCampaign>(
  {
    _id: { type: String },
    id: { type: String, required: true },
    tag: { type: String, required: true },
    title: { type: String, required: true },
    sub: { type: String, default: '' },
    emoji: { type: String, default: '' },
    ribbon: { type: String, default: '' },
    g1: { type: String, default: '#FF8A1E' },
    g2: { type: String, default: '#FFC24D' },
    validText: { type: String, default: '' },
    conditions: { type: String, default: '' },
    restaurantIds: { type: [String], default: [] },
    couponCode: { type: String },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'go_campaigns',
  },
);

GoCampaignSchema.index({ isActive: 1 });

export const GoCampaign = createModelProxy<IGoCampaign>('GoCampaign', GoCampaignSchema);
