// packages/shared/shared-persistence/src/schemas/backend/vendor-profile.schema.ts
// VendorProfile — Prisma → Mongoose migration (ADR-005 Faz 2a)
// Document-model decision: Embed (Vendor içinde 1:1)

import { Schema, model } from 'mongoose';

export interface IVendorProfile {
  _id?: string;
  vendorId: string;
  storeName: string;
  description?: string;
  logo?: string;
  banner?: string;
  storePhone?: string;
  storeEmail?: string;
  defaultLanguage?: string;
  defaultCurrency?: string;
  operatingHours?: Record<string, unknown>;
  holidayMode?: boolean;
  acceptingOrders?: boolean;
  deliveryRadius?: number;
  minOrderAmount?: number;
  avgDeliveryTime?: number;
}

export const VendorProfileSchema = new Schema<IVendorProfile>({
  _id: { type: String },
  vendorId: { type: String, required: true },
  storeName: { type: String, required: true },
  description: { type: String },
  logo: { type: String },
  banner: { type: String },
  storePhone: { type: String },
  storeEmail: { type: String },
  defaultLanguage: { type: String, default: 'tr' },
  defaultCurrency: { type: String, default: 'TRY' },
  operatingHours: { type: Schema.Types.Mixed },
  holidayMode: { type: Boolean, default: false },
  acceptingOrders: { type: Boolean, default: true },
  deliveryRadius: { type: Number },
  minOrderAmount: { type: Number },
  avgDeliveryTime: { type: Number },
}, {
  timestamps: true,
  collection: 'vendor_profiles',
});

VendorProfileSchema.index({ vendorId: 1 }, { unique: true });

export const VendorProfile = model<IVendorProfile>('VendorProfile', VendorProfileSchema);