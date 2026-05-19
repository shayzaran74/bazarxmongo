import { Schema, model, Types } from 'mongoose';

// apps/backend/node_modules/@barterborsa/shared-persistence/schemas/backend/buybox-history.schema.ts
// BuyboxHistory — buybox score geçmişi kaydı (Master Plan §3.8)

export interface IBuyboxHistory {
  _id?: string;
  id: string;
  productId: string;
  listingId: string;
  vendorId: string;
  score: Types.Decimal128;
  priceScore: Types.Decimal128;
  ratingScore: Types.Decimal128;
  deliveryScore: Types.Decimal128;
  stockScore: Types.Decimal128;
  winnerAt: Date;
  previousWinnerId?: string;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const BuyboxHistorySchema = new Schema<IBuyboxHistory>({
  _id: { type: String },
  id: { type: String, required: true },
  productId: { type: String, alias: 'product_id' },
  listingId: { type: String, alias: 'listing_id' },
  vendorId: { type: String, alias: 'vendor_id' },
  score: { type: Types.Decimal128 },
  priceScore: { type: Types.Decimal128, alias: 'price_score' },
  ratingScore: { type: Types.Decimal128, alias: 'rating_score' },
  deliveryScore: { type: Types.Decimal128, alias: 'delivery_score' },
  stockScore: { type: Types.Decimal128, alias: 'stock_score' },
  winnerAt: { type: Date, alias: 'winner_at' },
  previousWinnerId: { type: String, alias: 'previous_winner_id' },
  reason: { type: String },
  createdAt: { type: Date, alias: 'created_at' },
  updatedAt: { type: Date, alias: 'updated_at' },
}, {
  timestamps: true,
  collection: 'buybox_history',
});

BuyboxHistorySchema.index({ productId: 1, winnerAt: -1 });
BuyboxHistorySchema.index({ listingId: 1 });
BuyboxHistorySchema.index({ vendorId: 1 });

export const BuyboxHistory = model<IBuyboxHistory>('BuyboxHistory', BuyboxHistorySchema);