import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema } from 'mongoose';

export interface IBrand {
  _id?: string;
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  order: number;
  description?: string;
  isOfficial: boolean;
  isPopular: boolean;
  popularityScore: number;
  productCount: number;
  violationCount: number;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  reviewedBy?: string;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  vendorId?: string;
  blurhash?: string;
  documentUrl?: string;
  invoiceChainUrl?: string;
  authorizationUrl?: string;
  status?: string;
}

export const BrandSchema = new Schema<IBrand>({
  _id: { type: String },
  id: { type: String, required: true },
  name: { type: String },
  slug: { type: String },
  icon: { type: String },
  image: { type: String },
  order: { type: Number, default: 0 },
  description: { type: String },
  isOfficial: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  popularityScore: { type: Number, default: 0 },
  productCount: { type: Number, default: 0 },
  violationCount: { type: Number, default: 0 },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  rejectionReason: { type: String },
  reviewedBy: { type: String },
  submittedAt: { type: Date },
  createdAt: { type: Date },
  updatedAt: { type: Date },
  vendorId: { type: String },
  blurhash: { type: String },
  documentUrl: { type: String },
  invoiceChainUrl: { type: String },
  authorizationUrl: { type: String },
  status: { type: String, default: 'PENDING' },
}, {
  timestamps: true,
  collection: 'brands',
});

BrandSchema.index({ vendorId: 1 });
BrandSchema.index({ slug: 1, isOfficial: 1 });
BrandSchema.index({ isPopular: 1, popularityScore: -1 });
BrandSchema.index({ status: 1 });

export const Brand = createModelProxy<IBrand>('Brand', BrandSchema);