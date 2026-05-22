import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// VendorBanner — generated from Prisma schema
// TODO: strict typing — codegen

export interface IVendorBanner {
  _id?: string;
  id: string;
  type: number;
  template: string;
  order: number;
  createdAt: Date;
  imageUrl: string;
  isActive: boolean;
  linkUrl?: string;
  rejectionReason?: string;
  updatedAt: Date;
  vendorId: string;
}

export const VendorBannerSchema = new Schema<IVendorBanner>({
  _id: { type: String },
  id: { type: String, required: true },
  type: { type: Number, default: 1 },
  template: { type: String, default: 'A' },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, alias: 'created_at' },
  imageUrl: { type: String, alias: 'image_url' },
  isActive: { type: Boolean, default: false, alias: 'is_active' },
  linkUrl: { type: String, alias: 'link_url' },
  rejectionReason: { type: String, alias: 'rejection_reason' },
  updatedAt: { type: Date, alias: 'updated_at' },
  vendorId: { type: String, alias: 'vendor_id' },
}, {
  timestamps: true,
  collection: 'vendor_banners',
});

// Composite index
VendorBannerSchema.index({ vendorId: 1 });

export const VendorBanner = createModelProxy<IVendorBanner>('VendorBanner', VendorBannerSchema);
