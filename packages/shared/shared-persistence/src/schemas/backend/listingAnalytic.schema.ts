import { Schema, model, Types } from 'mongoose';

export interface IListingAnalytic {
  _id?: string;
  id: string;
  listingId: string;
  views: number;
  clicks: number;
  sales: number;
  revenue: Types.Decimal128;
  date: Date;
}

export const ListingAnalyticSchema = new Schema<IListingAnalytic>({
  _id: { type: String },
  id: { type: String, required: true },
  listingId: { type: String },
  views: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  sales: { type: Number, default: 0 },
  revenue: { type: Types.Decimal128, default: 0 },
  date: { type: Date },
}, {
  timestamps: true,
  collection: 'listing_analytics',
});

ListingAnalyticSchema.index({ date: 1 });
ListingAnalyticSchema.index({ listingId: 1, date: 1 }, { unique: true });

export const ListingAnalytic = model<IListingAnalytic>('ListingAnalytic', ListingAnalyticSchema);