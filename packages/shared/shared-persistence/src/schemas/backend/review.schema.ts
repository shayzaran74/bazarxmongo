// packages/shared/shared-persistence/src/schemas/backend/review.schema.ts
import { Schema, model } from 'mongoose';

export interface IReview {
  _id?: string;
  id: string;
  userId: string;
  catalogProductId: string;
  orderId?: string;
  rating: number;
  comment?: string;
  isApproved: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const ReviewSchema = new Schema<IReview>({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String },
  catalogProductId: { type: String },
  orderId: { type: String },
  rating: { type: Number },
  comment: { type: String },
  isApproved: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'reviews',
});

ReviewSchema.index({ catalogProductId: 1 });
ReviewSchema.index({ orderId: 1 });
ReviewSchema.index({ userId: 1, catalogProductId: 1 }, { unique: true });

export const Review = model<IReview>('Review', ReviewSchema);