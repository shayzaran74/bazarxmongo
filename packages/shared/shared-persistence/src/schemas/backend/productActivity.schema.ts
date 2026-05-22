import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// ProductActivity — generated from Prisma schema
// TODO: strict typing — codegen

export interface IProductActivity {
  _id?: string;
  id: string;
  type: string;
  catalogProductId?: string;
  createdAt: Date;
  listingId?: string;
  metadata?: Schema.Types.Mixed;
  userId?: string;
}

export const ProductActivitySchema = new Schema<IProductActivity>({
  _id: { type: String },
  id: { type: String, required: true },
  type: { type: String },
  catalogProductId: { type: String, alias: 'catalog_product_id' },
  createdAt: { type: Date, alias: 'created_at' },
  listingId: { type: String, alias: 'listing_id' },
  metadata: { type: Schema.Types.Mixed },
  userId: { type: String, alias: 'user_id' },
}, {
  timestamps: true,
  collection: 'product_activities',
});

// Composite index
ProductActivitySchema.index({ listingId: 1 });

// Composite index
ProductActivitySchema.index({ catalogProductId: 1 });

// Composite index
ProductActivitySchema.index({ type: 1 });

// Composite index
ProductActivitySchema.index({ createdAt: 1 });

// Composite index
ProductActivitySchema.index({ userId: 1 });

export const ProductActivity = createModelProxy<IProductActivity>('ProductActivity', ProductActivitySchema);
