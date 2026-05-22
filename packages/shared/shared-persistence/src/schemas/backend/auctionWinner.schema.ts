import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

export interface IAuctionWinner {
  _id?: string;
  id: string;
  auctionId: string;
  userId: string;
  position: number;
  amount?: Types.Decimal128;
  createdAt: Date;
}

export const AuctionWinnerSchema = new Schema<IAuctionWinner>({
  _id: { type: String },
  id: { type: String, required: true },
  auctionId: { type: String },
  userId: { type: String },
  position: { type: Number },
  amount: { type: Types.Decimal128 },
  createdAt: { type: Date },
}, {
  timestamps: true,
  collection: 'auction_winners',
});

AuctionWinnerSchema.index({ auctionId: 1 });
AuctionWinnerSchema.index({ userId: 1 });
AuctionWinnerSchema.index({ auctionId: 1, position: 1 }, { unique: true });

export const AuctionWinner = createModelProxy<IAuctionWinner>('AuctionWinner', AuctionWinnerSchema);