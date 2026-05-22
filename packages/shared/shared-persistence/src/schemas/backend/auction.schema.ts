import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

export const AuctionStatus = ['SCHEDULED','ACTIVE','ENDED','COMPLETED','CANCELLED'] as const;
export type AuctionStatusType = typeof AuctionStatus[number];

export interface IAuction {
  _id?: string;
  id: string;
  listingId: string;
  userId: string;
  status: AuctionStatusType;
  startingPrice: Types.Decimal128;
  currentPrice: Types.Decimal128;
  minBidIncrement: Types.Decimal128;
  participationDeposit?: Types.Decimal128;
  currentWinnerStep: number;
  startTime: Date;
  endTime: Date;
  paymentDeadline?: Date;
  winnerId?: string;
  winner2Id?: string;
  winner3Id?: string;
  createdAt: Date;
  updatedAt: Date;
  version?: number;
}

export const AuctionSchema = new Schema<IAuction>({
  _id: { type: String },
  id: { type: String, required: true },
  listingId: { type: String },
  userId: { type: String },
  status: { type: String, enum: AuctionStatus, default: 'SCHEDULED' },
  startingPrice: { type: Types.Decimal128 },
  currentPrice: { type: Types.Decimal128 },
  minBidIncrement: { type: Types.Decimal128, default: 1 },
  participationDeposit: { type: Types.Decimal128 },
  currentWinnerStep: { type: Number, default: 1 },
  startTime: { type: Date },
  endTime: { type: Date },
  paymentDeadline: { type: Date },
  winnerId: { type: String },
  winner2Id: { type: String },
  winner3Id: { type: String },
  createdAt: { type: Date },
  updatedAt: { type: Date },
  version: { type: Number, default: 1 },
}, {
  timestamps: true,
  collection: 'auctions',
});

AuctionSchema.index({ status: 1, endTime: 1 });
AuctionSchema.index({ listingId: 1 });
AuctionSchema.index({ userId: 1 });
AuctionSchema.index({ status: 1, startTime: 1 });

export const Auction = createModelProxy<IAuction>('Auction', AuctionSchema);