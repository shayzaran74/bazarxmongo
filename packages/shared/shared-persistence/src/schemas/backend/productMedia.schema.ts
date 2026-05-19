// packages/shared/shared-persistence/src/schemas/backend/productMedia.schema.ts
import { Schema, model } from 'mongoose';

export const MediaType = ['IMAGE','VIDEO','360','AUDIO'] as const;
export type MediaTypeType = typeof MediaType[number];

export interface IProductMedia {
  _id?: string;
  id: string;
  productId: string;
  url: string;
  blurhash?: string;
  type: MediaTypeType;
  sortOrder: number;
}

export const ProductMediaSchema = new Schema<IProductMedia>({
  _id: { type: String },
  id: { type: String, required: true },
  productId: { type: String },
  url: { type: String },
  blurhash: { type: String },
  type: { type: String, enum: MediaType, default: 'IMAGE' },
  sortOrder: { type: Number, default: 0 },
}, {
  timestamps: true,
  collection: 'product_media',
});

ProductMediaSchema.index({ productId: 1 });
ProductMediaSchema.index({ sortOrder: 1 });

export const ProductMedia = model<IProductMedia>('ProductMedia', ProductMediaSchema);