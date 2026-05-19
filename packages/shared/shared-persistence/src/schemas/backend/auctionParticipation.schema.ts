import { Schema, model, Types } from 'mongoose';

export const ParticipationStatus = ['PENDING','DEPOSIT_HELD','APPROVED','ACTIVE','WITHDRAWN'] as const;
export type ParticipationStatusType = typeof ParticipationStatus[number];

export interface IAuctionParticipation {
  _id?: string;
  id: string;
  auctionId: string;
  userId: string;
  status: ParticipationStatusType;
  blockedAmount: Types.Decimal128;
  holdId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const AuctionParticipationSchema = new Schema<IAuctionParticipation>({
  _id: { type: String },
  id: { type: String, required: true },
  auctionId: { type: String },
  userId: { type: String },
  status: { type: String, enum: ParticipationStatus, default: 'PENDING' },
  blockedAmount: { type: Types.Decimal128, default: 0 },
  holdId: { type: String },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'auction_participations',
});

AuctionParticipationSchema.index({ auctionId: 1, userId: 1 }, { unique: true });
AuctionParticipationSchema.index({ userId: 1 });

export const AuctionParticipation = model<IAuctionParticipation>('AuctionParticipation', AuctionParticipationSchema);