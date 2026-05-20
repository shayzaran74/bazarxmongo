// packages/shared/shared-persistence/src/schemas/backend/garageSale.schema.ts
// Master Plan v4.3 §4.4 — Garaj Günü (Flash Sale)
// Fabrika belirli zaman aralığında indirimli stok satışı yapabilir.
// Stok atomic decrement edilir; süre dolunca veya stok bitince otomatik kapanır.

import { Schema, model, Types } from 'mongoose';

export const GarageSaleStatus = ['SCHEDULED', 'ACTIVE', 'EXHAUSTED', 'EXPIRED', 'CANCELLED'] as const;
export type GarageSaleStatusType = typeof GarageSaleStatus[number];

export interface IGarageSale {
  _id?: string;
  id: string;
  // Fabrika (APEX vendor) ve ürün referansları
  factoryId: string;        // Vendor.id (APEX zorunlu)
  ecosystemId: string;      // Ekosistemin sahibi olduğu fabrika
  listingId: string;        // Üzerinden satış yapılacak listing
  // Master Plan §4.4 — Fabrika tarafından belirlenen parametreler
  discountRate: Types.Decimal128;     // 0.00 — 1.00 (örn: 0.30 = %30 indirim)
  maxTotalQty: number;                // Toplam kampanya stok limiti
  soldQty: number;                    // Atomic $inc edilen alan
  maxQtyPerDealer: number;            // Bayi başına limit (Watchover'dan bağımsız)
  startsAt: Date;
  endsAt: Date;
  status: GarageSaleStatusType;
  // Para alanları — float yasak, Decimal128 zorunlu (financial-services-expert)
  normalPrice: Types.Decimal128;
  discountedPrice: Types.Decimal128;
  closedAt?: Date;
  closedReason?: 'STOCK_EXHAUSTED' | 'TIME_EXPIRED' | 'MANUAL_CANCEL';
  createdAt: Date;
  updatedAt: Date;
}

export const GarageSaleSchema = new Schema<IGarageSale>({
  _id: { type: String },
  id: { type: String, required: true },
  factoryId: { type: String, required: true, alias: 'factory_id' },
  ecosystemId: { type: String, required: true, alias: 'ecosystem_id' },
  listingId: { type: String, required: true, alias: 'listing_id' },
  discountRate: { type: Types.Decimal128, required: true, alias: 'discount_rate' },
  maxTotalQty: { type: Number, required: true, min: 1, alias: 'max_total_qty' },
  soldQty: { type: Number, default: 0, alias: 'sold_qty' },
  maxQtyPerDealer: { type: Number, required: true, min: 1, alias: 'max_qty_per_dealer' },
  startsAt: { type: Date, required: true, alias: 'starts_at' },
  endsAt: { type: Date, required: true, alias: 'ends_at' },
  status: { type: String, enum: GarageSaleStatus, default: 'SCHEDULED' },
  normalPrice: { type: Types.Decimal128, required: true, alias: 'normal_price' },
  discountedPrice: { type: Types.Decimal128, required: true, alias: 'discounted_price' },
  closedAt: { type: Date, alias: 'closed_at' },
  closedReason: { type: String, alias: 'closed_reason' },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'garage_sales',
});

GarageSaleSchema.index({ factoryId: 1, status: 1 });
GarageSaleSchema.index({ ecosystemId: 1, status: 1 });
GarageSaleSchema.index({ status: 1, endsAt: 1 });
GarageSaleSchema.index({ listingId: 1 });

// Master Plan §4.4 — Tarih ve indirim oranı tutarlılığı
GarageSaleSchema.pre('validate', function (next) {
  if (this.startsAt && this.endsAt && this.startsAt >= this.endsAt) {
    return next(new Error('GARAGE_SALE_STARTS_AT_MUST_BE_BEFORE_ENDS_AT'));
  }
  const rate = parseFloat(this.discountRate?.toString() ?? '0');
  if (!Number.isFinite(rate) || rate <= 0 || rate >= 1) {
    return next(new Error('GARAGE_SALE_DISCOUNT_RATE_OUT_OF_RANGE'));
  }
  next();
});

export const GarageSale = model<IGarageSale>('GarageSale', GarageSaleSchema);

// Bayinin Garaj Günü siparişlerinin toplamı (Watchover'a benzer, ayrı tablo)
export interface IGarageSalePurchase {
  _id?: string;
  id: string;
  garageSaleId: string;
  dealerId: string;            // Sipariş veren bayi
  quantity: number;
  unitPrice: Types.Decimal128; // Sipariş anında discountedPrice
  totalPrice: Types.Decimal128;
  createdAt: Date;
}

export const GarageSalePurchaseSchema = new Schema<IGarageSalePurchase>({
  _id: { type: String },
  id: { type: String, required: true },
  garageSaleId: { type: String, required: true, alias: 'garage_sale_id' },
  dealerId: { type: String, required: true, alias: 'dealer_id' },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Types.Decimal128, required: true, alias: 'unit_price' },
  totalPrice: { type: Types.Decimal128, required: true, alias: 'total_price' },
  createdAt: { type: Date },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'garage_sale_purchases',
});

GarageSalePurchaseSchema.index({ garageSaleId: 1, dealerId: 1 });

export const GarageSalePurchase = model<IGarageSalePurchase>('GarageSalePurchase', GarageSalePurchaseSchema);
