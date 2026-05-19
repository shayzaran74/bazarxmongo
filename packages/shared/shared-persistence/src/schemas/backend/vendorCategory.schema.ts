import { Schema, model, Types } from 'mongoose';

// VendorCategory — generated from Prisma schema
// TODO: strict typing — codegen

export interface IVendorCategory {
  _id?: string;
  categoryId: string;
  createdAt: Date;
  vendorId: string;
}

export const VendorCategorySchema = new Schema<IVendorCategory>({
  _id: { type: String },
  categoryId: { type: String, alias: 'category_id' },
  createdAt: { type: Date, alias: 'created_at' },
  vendorId: { type: String, alias: 'vendor_id' },
}, {
  timestamps: true,
  collection: 'vendor_categories',
});

// Composite index
VendorCategorySchema.index({ categoryId: 1 });

// Composite index
VendorCategorySchema.index({ vendorId: 1 });

export const VendorCategory = model<IVendorCategory>('VendorCategory', VendorCategorySchema);
