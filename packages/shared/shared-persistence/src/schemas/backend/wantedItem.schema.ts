import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// WantedItem — generated from Prisma schema
// TODO: strict typing — codegen

export interface IWantedItem {
  _id?: string;
  id: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  categoryId: string;
  companyId?: string;
  createdAt: Date;
  isActive: boolean;
  maxPrice?: Types.Decimal128;
  minPrice?: Types.Decimal128;
  updatedAt: Date;
  userId?: string;
}

export const WantedItemSchema = new Schema<IWantedItem>({
  _id: { type: String },
  id: { type: String, required: true },
  description: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  categoryId: { type: String, alias: 'category_id' },
  companyId: { type: String, alias: 'company_id' },
  createdAt: { type: Date, alias: 'created_at' },
  isActive: { type: Boolean, default: true, alias: 'is_active' },
  maxPrice: { type: Types.Decimal128, alias: 'max_price' },
  minPrice: { type: Types.Decimal128, alias: 'min_price' },
  updatedAt: { type: Date, alias: 'updated_at' },
  userId: { type: String, alias: 'user_id' },
}, {
  timestamps: true,
  collection: 'wanted_items',
});

// Composite index
WantedItemSchema.index({ companyId: 1 });

// Composite index
WantedItemSchema.index({ userId: 1 });

// Composite index
WantedItemSchema.index({ categoryId: 1 });

export const WantedItem = createModelProxy<IWantedItem>('WantedItem', WantedItemSchema);
