import { Schema, model, Types } from 'mongoose';

export interface IVendorProfile {
  _id?: string;
  id: string;
  vendorId: string;
  storeName: string;
  description?: string;
  logo?: string;
  banner?: string;
  supportEmail?: string;
  isFeatured: boolean;
  featuredUntil?: Date;
  city?: string;
  district?: string;
  openingHours?: Record<string, unknown>;
  cuisineType?: string;
  deliveryRadius?: number;
  minOrderAmount?: Types.Decimal128;
  avgPrepTimeMinutes?: number;
}

export const VendorProfileSchema = new Schema<IVendorProfile>({
  _id: { type: String },
  id: { type: String, required: true },
  vendorId: { type: String, alias: 'vendor_id' },
  storeName: { type: String, alias: 'store_name' },
  description: { type: String },
  logo: { type: String },
  banner: { type: String },
  supportEmail: { type: String, alias: 'support_email' },
  isFeatured: { type: Boolean, default: false, alias: 'is_featured' },
  featuredUntil: { type: Date, alias: 'featured_until' },
  city: { type: String },
  district: { type: String },
  openingHours: { type: Schema.Types.Mixed, alias: 'opening_hours' },
  cuisineType: { type: String, alias: 'cuisine_type' },
  deliveryRadius: { type: Number, alias: 'delivery_radius' },
  minOrderAmount: { type: Types.Decimal128, alias: 'min_order_amount' },
  avgPrepTimeMinutes: { type: Number, alias: 'avg_prep_time_minutes' },
}, {
  timestamps: true,
  collection: 'vendor_profiles',
});

// Composite index
VendorProfileSchema.index({ city: 1 });

export const VendorProfile = model<IVendorProfile>('VendorProfile', VendorProfileSchema);
