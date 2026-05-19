import { Schema, model, Types } from 'mongoose';

// Favorite — generated from Prisma schema
// TODO: strict typing — codegen

export interface IFavorite {
  _id?: string;
  id: string;
  userId: string;
  catalogProductId: string;
  createdAt: Date;
}

export const FavoriteSchema = new Schema<IFavorite>({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String, alias: 'user_id' },
  catalogProductId: { type: String, alias: 'catalog_product_id' },
  createdAt: { type: Date, alias: 'created_at' },
}, {
  timestamps: true,
  collection: 'favorites',
});

// Composite index
FavoriteSchema.index({ userId: 1 });

// Unique constraint
FavoriteSchema.index({ userId: 1, catalogProductId: 1 }, { unique: true });

export const Favorite = model<IFavorite>('Favorite', FavoriteSchema);
