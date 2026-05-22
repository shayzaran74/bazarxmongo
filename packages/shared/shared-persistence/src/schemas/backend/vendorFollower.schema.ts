import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// VendorFollower — generated from Prisma schema
// TODO: strict typing — codegen

export interface IVendorFollower {
  _id?: string;
  id: string;
  createdAt: Date;
  userId: string;
  vendorId: string;
}

export const VendorFollowerSchema = new Schema<IVendorFollower>({
  _id: { type: String },
  id: { type: String, required: true },
  createdAt: { type: Date, alias: 'created_at' },
  userId: { type: String, alias: 'user_id' },
  vendorId: { type: String, alias: 'vendor_id' },
}, {
  timestamps: true,
  collection: 'vendor_followers',
});

// Composite index
VendorFollowerSchema.index({ userId: 1 });

// Composite index
VendorFollowerSchema.index({ vendorId: 1 });

// Unique constraint
VendorFollowerSchema.index({ userId: 1, vendorId: 1 }, { unique: true });

export const VendorFollower = createModelProxy<IVendorFollower>('VendorFollower', VendorFollowerSchema);
