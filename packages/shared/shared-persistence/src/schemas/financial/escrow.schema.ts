import { Schema, model, Types } from 'mongoose';

export const EscrowStatus = ['PENDING','FUNDED','HELD','RELEASED','REFUNDED','DISPUTED','CANCELLED'] as const;
export type EscrowStatusType = typeof EscrowStatus[number];

export interface IEscrow {
  _id?: string;
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  amount: Types.Decimal128;
  status: EscrowStatusType;
  createdAt: Date;
  updatedAt: Date;
  releasedAt?: Date;
  payoutLog?: Schema.Types.Mixed;
  releasedAmount: Types.Decimal128;
}

export const EscrowSchema = new Schema<IEscrow>({
  _id: { type: String },
  id: { type: String, required: true },
  orderId: { type: String },
  buyerId: { type: String },
  sellerId: { type: String },
  amount: { type: Types.Decimal128 },
  status: { type: String, enum: EscrowStatus, default: 'PENDING' },
  createdAt: { type: Date },
  updatedAt: { type: Date },
  releasedAt: { type: Date },
  payoutLog: { type: Schema.Types.Mixed },
  releasedAmount: { type: Types.Decimal128, default: 0 },
}, {
  timestamps: true,
  collection: 'escrows',
});

EscrowSchema.index({ buyerId: 1 });
EscrowSchema.index({ sellerId: 1 });
EscrowSchema.index({ orderId: 1 });
EscrowSchema.index({ status: 1 });

export const Escrow = model<IEscrow>('Escrow', EscrowSchema);