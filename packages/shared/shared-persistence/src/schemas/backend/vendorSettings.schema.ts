import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// VendorSettings — generated from Prisma schema
// TODO: strict typing — codegen

export interface IVendorSettings {
  _id?: string;
  id: string;
  vendorId: string;
  listingLimit: number;
  commissionRate: Types.Decimal128;
  deliveryTimeDays: number;
  minOrderAmount: Types.Decimal128;
  returnPolicy?: string;
  shippingPolicy?: string;
  preferredCurrency: string;
  vatIncluded: boolean;
  vacationMode: boolean;
  vacationEndAt?: Date;
  autoFulfill: boolean;
  commissionAdjustments?: Record<string, unknown>;
  holidayMode: boolean;
  acceptingOrders: boolean;
}

export const VendorSettingsSchema = new Schema<IVendorSettings>({
  _id: { type: String },
  id: { type: String, required: true },
  vendorId: { type: String, alias: 'vendor_id' },
  listingLimit: { type: Number, default: 100, alias: 'listing_limit' },
  commissionRate: { type: Types.Decimal128, default: 10, alias: 'commission_rate' },
  deliveryTimeDays: { type: Number, default: 3, alias: 'delivery_time_days' },
  minOrderAmount: { type: Types.Decimal128, default: 0, alias: 'min_order_amount' },
  returnPolicy: { type: String, alias: 'return_policy' },
  shippingPolicy: { type: String, alias: 'shipping_policy' },
  preferredCurrency: { type: String, default: 'TRY', alias: 'preferred_currency' },
  vatIncluded: { type: Boolean, default: true, alias: 'vat_included' },
  vacationMode: { type: Boolean, default: false, alias: 'vacation_mode' },
  vacationEndAt: { type: Date, alias: 'vacation_end_at' },
  autoFulfill: { type: Boolean, default: false, alias: 'auto_fulfill' },
  commissionAdjustments: { type: Object, alias: 'commission_adjustments' },
  holidayMode: { type: Boolean, default: false, alias: 'holiday_mode' },
  acceptingOrders: { type: Boolean, default: true, alias: 'accepting_orders' },
}, {
  timestamps: true,
  collection: 'vendor_settings',
});

export const VendorSettings = createModelProxy<IVendorSettings>('VendorSettings', VendorSettingsSchema);
