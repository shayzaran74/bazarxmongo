// packages/shared/shared-persistence/src/schemas/backend/cart.schema.ts
import { Schema, model } from 'mongoose';

export interface ICart {
  _id?: string;
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const CartSchema = new Schema<ICart>({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'carts',
});

CartSchema.index({ userId: 1 }, { unique: true });

export const Cart = model<ICart>('Cart', CartSchema);