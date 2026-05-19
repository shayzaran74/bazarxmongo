import { Schema, model, Types } from 'mongoose';

// TradeMatch — generated from Prisma schema
// TODO: strict typing — codegen

export interface ITradeMatch {
  _id?: string;
  id: string;
  offerId: string;
  completedAt: Date;
  matchScore: number;
  proximityScore?: number;
}

export const TradeMatchSchema = new Schema<ITradeMatch>({
  _id: { type: String },
  id: { type: String, required: true },
  offerId: { type: String, alias: 'offer_id' },
  completedAt: { type: Date, alias: 'completed_at' },
  matchScore: { type: Number, default: 0, alias: 'match_score' },
  proximityScore: { type: Number, default: 0, alias: 'proximity_score' },
}, {
  timestamps: true,
  collection: 'trade_matches',
});

export const TradeMatch = model<ITradeMatch>('TradeMatch', TradeMatchSchema);
