import { Schema, model, Types } from 'mongoose';

// HomeQuadCardItem — generated from Prisma schema
// TODO: strict typing — codegen

export interface IHomeQuadCardItem {
  _id?: string;
  id: string;
  order: number;
  image: string;
  link?: string;
  productId?: string;
  quadCardId: string;
  title: string;
}

export const HomeQuadCardItemSchema = new Schema<IHomeQuadCardItem>({
  _id: { type: String },
  id: { type: String, required: true },
  order: { type: Number, default: 0 },
  image: { type: String },
  link: { type: String },
  productId: { type: String, alias: 'product_id' },
  quadCardId: { type: String, alias: 'quad_card_id' },
  title: { type: String },
}, {
  timestamps: true,
  collection: 'home_quad_card_items',
});

// Composite index
HomeQuadCardItemSchema.index({ quadCardId: 1, order: 1 });

// Composite index
HomeQuadCardItemSchema.index({ productId: 1 });

export const HomeQuadCardItem = model<IHomeQuadCardItem>('HomeQuadCardItem', HomeQuadCardItemSchema);
