import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema } from 'mongoose';

export interface IListingStats {
  _id?: string;
  id: string;
  listingId: string;
  views: number;
  sales: number;
  updatedAt: Date;
}

export const ListingStatsSchema = new Schema<IListingStats>({
  _id: { type: String },
  id: { type: String, required: true },
  listingId: { type: String },
  views: { type: Number, default: 0 },
  sales: { type: Number, default: 0 },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'listing_stats',
});

ListingStatsSchema.index({ listingId: 1 }, { unique: true });

export const ListingStats = createModelProxy<IListingStats>('ListingStats', ListingStatsSchema);