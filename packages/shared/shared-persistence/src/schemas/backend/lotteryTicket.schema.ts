import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

export interface ILotteryTicket {
  _id?: string;
  id: string;
  lotteryId: string;
  userId: string;
  numbers: string;
  createdAt: Date;
}

export const LotteryTicketSchema = new Schema<ILotteryTicket>({
  _id: { type: String },
  id: { type: String, required: true },
  lotteryId: { type: String },
  userId: { type: String },
  numbers: { type: String }, // comma-separated digits, e.g. "5,3,9"
  createdAt: { type: Date },
}, {
  timestamps: true,
  collection: 'lottery_tickets',
});

LotteryTicketSchema.index({ lotteryId: 1 });
LotteryTicketSchema.index({ userId: 1 });
LotteryTicketSchema.index({ lotteryId: 1, userId: 1 });

export const LotteryTicket = createModelProxy<ILotteryTicket>('LotteryTicket', LotteryTicketSchema);