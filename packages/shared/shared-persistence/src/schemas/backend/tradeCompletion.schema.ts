import { Schema, model, Types } from 'mongoose';

// TradeCompletion — generated from Prisma schema
// TODO: strict typing — codegen

export interface ITradeCompletion {
  _id?: string;
  id: string;
  notes?: string;
  cashDifference?: Types.Decimal128;
  completedAt: Date;
  fromItemQuantity?: Types.Decimal128;
  toItemQuantity?: Types.Decimal128;
  tradeOfferId: string;
}

export const TradeCompletionSchema = new Schema<ITradeCompletion>({
  _id: { type: String },
  id: { type: String, required: true },
  notes: { type: String },
  cashDifference: { type: Types.Decimal128, alias: 'cash_difference' },
  completedAt: { type: Date, alias: 'completed_at' },
  fromItemQuantity: { type: Types.Decimal128, alias: 'from_item_quantity' },
  toItemQuantity: { type: Types.Decimal128, alias: 'to_item_quantity' },
  tradeOfferId: { type: String, alias: 'trade_offer_id' },
}, {
  timestamps: true,
  collection: 'trade_completions',
});

// Composite index
TradeCompletionSchema.index({ tradeOfferId: 1 });

export const TradeCompletion = model<ITradeCompletion>('TradeCompletion', TradeCompletionSchema);
