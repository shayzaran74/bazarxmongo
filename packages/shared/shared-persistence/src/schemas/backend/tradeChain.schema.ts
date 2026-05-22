import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// TradeChain — generated from Prisma schema
// TODO: strict typing — codegen

export interface ITradeChain {
  _id?: string;
  id: string;
  createdAt: Date;
  expiresAt?: Date;
  matchScore?: number;
  totalValue?: Types.Decimal128;
  updatedAt: Date;
}

export const TradeChainSchema = new Schema<ITradeChain>({
  _id: { type: String },
  id: { type: String, required: true },
  createdAt: { type: Date, alias: 'created_at' },
  expiresAt: { type: Date, alias: 'expires_at' },
  matchScore: { type: Number, alias: 'match_score' },
  totalValue: { type: Types.Decimal128, alias: 'total_value' },
  updatedAt: { type: Date, alias: 'updated_at' },
}, {
  timestamps: true,
  collection: 'trade_chains',
});

export const TradeChain = createModelProxy<ITradeChain>('TradeChain', TradeChainSchema);
