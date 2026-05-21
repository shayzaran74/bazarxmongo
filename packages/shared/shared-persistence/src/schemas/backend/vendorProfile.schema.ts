// packages/shared/shared-persistence/src/schemas/backend/vendorProfile.schema.ts

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
  // İletişim
  phone?: string;
  whatsapp?: string;
  website?: string;
  // Adres
  address?: string;
  zipCode?: string;
  country?: string;
  // Banka bilgileri
  bankName?: string;
  bankAccountName?: string;
  bankIban?: string;
  // Reklam & Vitrin ayarları
  adProductIdLeft?: string;
  adProductIdRight?: string;
  showAd?: boolean;
  showFlashSales?: boolean;
  flashProductIds?: string[];
  // Geofencing koordinatları (BazarX-GO §10)
  lat?: number;
  lng?: number;
}

export const VendorProfileSchema = new Schema<IVendorProfile>({
  _id:               { type: String },
  id:                { type: String, required: true },
  vendorId:          { type: String },
  storeName:         { type: String },
  description:       { type: String },
  logo:              { type: String },
  banner:            { type: String },
  supportEmail:      { type: String },
  isFeatured:        { type: Boolean, default: false },
  featuredUntil:     { type: Date },
  city:              { type: String },
  district:          { type: String },
  openingHours:      { type: Schema.Types.Mixed },
  cuisineType:       { type: String },
  deliveryRadius:    { type: Number },
  minOrderAmount:    { type: Types.Decimal128 },
  avgPrepTimeMinutes:{ type: Number },
  // İletişim
  phone:             { type: String },
  whatsapp:          { type: String },
  website:           { type: String },
  // Adres
  address:           { type: String },
  zipCode:           { type: String },
  country:           { type: String, default: 'Türkiye' },
  // Banka
  bankName:          { type: String },
  bankAccountName:   { type: String },
  bankIban:          { type: String },
  // Vitrin
  adProductIdLeft:   { type: String },
  adProductIdRight:  { type: String },
  showAd:            { type: Boolean, default: false },
  showFlashSales:    { type: Boolean, default: false },
  flashProductIds:   { type: [String], default: [] },
  // Geofencing
  lat:               { type: Number },
  lng:               { type: Number },
}, {
  timestamps: true,
  collection: 'vendor_profiles',
});

VendorProfileSchema.index({ vendorId: 1 }, { unique: true });
VendorProfileSchema.index({ city: 1 });
VendorProfileSchema.index({ lat: 1, lng: 1 });

export const VendorProfile = model<IVendorProfile>('VendorProfile', VendorProfileSchema);
