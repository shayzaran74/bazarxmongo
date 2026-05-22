import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema } from 'mongoose';

export interface IListingImage {
  _id?: string;
  id: string;
  listingId: string;
  url: string;
  order: number;
  createdAt: Date;
}

export const ListingImageSchema = new Schema<IListingImage>({
  _id: { type: String },
  id: { type: String, required: true },
  listingId: { type: String },
  url: { type: String },
  order: { type: Number, default: 0 },
  createdAt: { type: Date },
}, {
  timestamps: true,
  collection: 'listing_images',
});

ListingImageSchema.index({ listingId: 1 });

export const ListingImage = createModelProxy<IListingImage>('ListingImage', ListingImageSchema);