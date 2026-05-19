import { Schema, model, Types } from 'mongoose';

// BrandViolation — generated from Prisma schema
// TODO: strict typing — codegen

export interface IBrandViolation {
  _id?: string;
  id: string;
  description?: string;
  status: string;
  severity?: string;
  adminNotes?: string;
  brandId: string;
  createdAt: Date;
  relatedVendorId?: string;
  reporterId: string;
  reporterType: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  updatedAt: Date;
  violationType: string;
}

export const BrandViolationSchema = new Schema<IBrandViolation>({
  _id: { type: String },
  id: { type: String, required: true },
  description: { type: String },
  status: { type: String, default: 'PENDING' },
  severity: { type: String },
  adminNotes: { type: String, alias: 'admin_notes' },
  brandId: { type: String, alias: 'brand_id' },
  createdAt: { type: Date, alias: 'created_at' },
  relatedVendorId: { type: String, alias: 'related_vendor_id' },
  reporterId: { type: String, alias: 'reporter_id' },
  reporterType: { type: String, alias: 'reporter_type' },
  resolvedAt: { type: Date, alias: 'resolved_at' },
  resolvedBy: { type: String, alias: 'resolved_by' },
  updatedAt: { type: Date, alias: 'updated_at' },
  violationType: { type: String, alias: 'violation_type' },
}, {
  timestamps: true,
  collection: 'brand_violations',
});

// Composite index
BrandViolationSchema.index({ brandId: 1 });

// Composite index
BrandViolationSchema.index({ reporterId: 1 });

export const BrandViolation = model<IBrandViolation>('BrandViolation', BrandViolationSchema);
