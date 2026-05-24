import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// TradeReview — generated from Prisma schema
// TODO: strict typing — codegen

export interface ITradeReview {
  _id?: string;
  id: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  fromUserId: string;
  mediaUrl?: string;
  toUserId: string;
  tradeOfferId: string;
}

export const TradeReviewSchema = new Schema<ITradeReview>({
  _id: { type: String, default: () => { const { randomUUID } = require('crypto'); return randomUUID(); } },
  id: { type: String, required: true },
  rating: { type: Number },
  comment: { type: String },
  createdAt: { type: Date, alias: 'created_at' },
  fromUserId: { type: String, alias: 'from_user_id' },
  mediaUrl: { type: String, alias: 'media_url' },
  toUserId: { type: String, alias: 'to_user_id' },
  tradeOfferId: { type: String, alias: 'trade_offer_id' },
}, {
  timestamps: true,
  collection: 'trade_reviews',
});

// Composite index
TradeReviewSchema.index({ tradeOfferId: 1 });

// Composite index
TradeReviewSchema.index({ fromUserId: 1 });

// Composite index
TradeReviewSchema.index({ toUserId: 1 });

// Unique constraint
TradeReviewSchema.index({ tradeOfferId: 1, fromUserId: 1 }, { unique: true });

export const TradeReview = createModelProxy<ITradeReview>('TradeReview', TradeReviewSchema);
