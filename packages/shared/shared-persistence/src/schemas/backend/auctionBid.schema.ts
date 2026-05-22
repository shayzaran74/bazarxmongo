import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

export interface IAuctionBid {
  _id?: string;
  id: string;
  auctionId: string;
  userId: string;
  amount: Types.Decimal128;
  holdId?: string;
  createdAt: Date;
}

export const AuctionBidSchema = new Schema<IAuctionBid>({
  _id: { type: String },
  id: { type: String, required: true },
  auctionId: { type: String },
  userId: { type: String },
  amount: { type: Types.Decimal128 },
  holdId: { type: String },
  createdAt: { type: Date },
}, {
  timestamps: true,
  collection: 'auction_bids',
});

AuctionBidSchema.index({ auctionId: 1, createdAt: -1 });
AuctionBidSchema.index({ userId: 1 });

export const AuctionBid = createModelProxy<IAuctionBid>('AuctionBid', AuctionBidSchema);