import { Schema, model, Types } from 'mongoose';

// TradeOfferItem — generated from Prisma schema
// TODO: strict typing — codegen

export interface ITradeOfferItem {
  _id?: string;
  id: string;
  listingId?: string;
  surplusItemId?: string;
  quantity: Types.Decimal128;
  estimatedValue: Types.Decimal128;
  offeredOfferId?: string;
  requestedOfferId?: string;
}

export const TradeOfferItemSchema = new Schema<ITradeOfferItem>({
  _id: { type: String },
  id: { type: String, required: true },
  listingId: { type: String, alias: 'listing_id' },
  surplusItemId: { type: String, alias: 'surplus_item_id' },
  quantity: { type: Types.Decimal128 },
  estimatedValue: { type: Types.Decimal128, alias: 'estimated_value' },
  offeredOfferId: { type: String, alias: 'offered_offer_id' },
  requestedOfferId: { type: String, alias: 'requested_offer_id' },
}, {
  timestamps: true,
  collection: 'trade_offer_items',
});

// Composite index
TradeOfferItemSchema.index({ listingId: 1 });

export const TradeOfferItem = model<ITradeOfferItem>('TradeOfferItem', TradeOfferItemSchema);
