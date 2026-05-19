// packages/shared/shared-persistence/src/schemas/backend/cartItem.schema.ts
import { Schema, model } from 'mongoose';

export interface ICartItem {
  _id?: string;
  id: string;
  cartId: string;
  listingId: string;
  quantity: number;
  variantId?: string;
  addedAt: Date;
}

export const CartItemSchema = new Schema<ICartItem>({
  _id: { type: String },
  id: { type: String, required: true },
  cartId: { type: String },
  listingId: { type: String },
  quantity: { type: Number, default: 1 },
  variantId: { type: String },
  addedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'cart_items',
});

CartItemSchema.index({ cartId: 1 });
CartItemSchema.index({ listingId: 1 });
CartItemSchema.index({ cartId: 1, listingId: 1 });

export const CartItem = model<ICartItem>('CartItem', CartItemSchema);