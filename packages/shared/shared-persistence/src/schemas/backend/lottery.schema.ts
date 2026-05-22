import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

export const LotteryStatus = ['SCHEDULED','ACTIVE','DRAWING','COMPLETED','CANCELLED'] as const;
export type LotteryStatusType = typeof LotteryStatus[number];

export interface ILottery {
  _id?: string;
  id: string;
  ownerId: string;
  listingId?: string;
  title: string;
  prizeDescription?: string;
  imageUrl?: string;
  status: LotteryStatusType;
  ticketPrice: Types.Decimal128;
  prizeValue?: Types.Decimal128;
  ticketDigits: number;
  numbersPerTicket: number;
  totalTickets: number;
  maxTicketsPerUser: number;
  startTime: Date;
  endTime: Date;
  winnerId?: string;
  winningNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const LotterySchema = new Schema<ILottery>({
  _id: { type: String },
  id: { type: String, required: true },
  ownerId: { type: String },
  listingId: { type: String },
  title: { type: String },
  prizeDescription: { type: String },
  imageUrl: { type: String },
  status: { type: String, enum: LotteryStatus, default: 'SCHEDULED' },
  ticketPrice: { type: Types.Decimal128 },
  prizeValue: { type: Types.Decimal128 },
  ticketDigits: { type: Number, default: 3 },
  numbersPerTicket: { type: Number, default: 1 },
  totalTickets: { type: Number, default: 100 },
  maxTicketsPerUser: { type: Number, default: 10 },
  startTime: { type: Date },
  endTime: { type: Date },
  winnerId: { type: String },
  winningNumber: { type: String },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'lotteries',
});

LotterySchema.index({ endTime: 1 });
LotterySchema.index({ status: 1 });
LotterySchema.index({ listingId: 1 });
LotterySchema.index({ ownerId: 1 });

export const Lottery = createModelProxy<ILottery>('Lottery', LotterySchema);