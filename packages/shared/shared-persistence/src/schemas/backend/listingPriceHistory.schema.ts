import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

export interface IListingPriceHistory {
  _id?: string;
  id: string;
  listingId: string;
  price: Types.Decimal128;
  changedAt: Date;
}

export const ListingPriceHistorySchema = new Schema<IListingPriceHistory>({
  _id: { type: String },
  id: { type: String, required: true },
  listingId: { type: String },
  price: { type: Types.Decimal128 },
  changedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'listing_price_history',
});

ListingPriceHistorySchema.index({ listingId: 1 });
ListingPriceHistorySchema.index({ listingId: 1, changedAt: -1 });

export const ListingPriceHistory = createModelProxy<IListingPriceHistory>('ListingPriceHistory', ListingPriceHistorySchema);