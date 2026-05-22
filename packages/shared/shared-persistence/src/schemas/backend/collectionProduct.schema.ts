import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// CollectionProduct — generated from Prisma schema
// TODO: strict typing — codegen

export interface ICollectionProduct {
  _id?: string;
  id: string;
  collectionId: string;
  listingId: string;
  order: number;
}

export const CollectionProductSchema = new Schema<ICollectionProduct>({
  _id: { type: String },
  id: { type: String, required: true },
  collectionId: { type: String, alias: 'collection_id' },
  listingId: { type: String, alias: 'listing_id' },
  order: { type: Number, default: 0 },
}, {
  timestamps: true,
  collection: 'collection_products',
});

// Unique constraint
CollectionProductSchema.index({ collectionId: 1, listingId: 1 }, { unique: true });

export const CollectionProduct = createModelProxy<ICollectionProduct>('CollectionProduct', CollectionProductSchema);
