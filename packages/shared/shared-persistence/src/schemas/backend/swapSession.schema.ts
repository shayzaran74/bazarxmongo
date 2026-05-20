import { Schema, model, Types } from 'mongoose';

export const CollateralStatus = ['NONE','DEPOSITED','HELD','RELEASED','FORFEITED'] as const;
export type CollateralStatusType = typeof CollateralStatus[number];

// PENDING_COLLATERAL: teminat bekleniyor (Master Plan v4.3 §2 — barter-rules.md)
export const SwapSessionStatus = ['PENDING_COLLATERAL','PENDING','ACTIVE','SHIPPING','PARTIALLY_COMPLETED','COMPLETED','DISPUTED','CANCELLED','TIMEOUT'] as const;
export type SwapSessionStatusType = typeof SwapSessionStatus[number];

export interface ISwapSession {
  _id?: string;
  id: string;
  tradeOfferId: string;
  initiatorId: string;
  receiverId: string;
  status: SwapSessionStatusType;
  shipmentMode: string;
  shipments?: Schema.Types.Mixed;
  escrowId?: string;
  collateralAmount: Types.Decimal128;
  collateralCurrency: string;
  collateralStatus: CollateralStatusType;
  collateralLockedAt?: Date;
  collateralReleasedAt?: Date;
  collateralForfeitedAt?: Date;
  fromCollateralHoldId?: string;
  toCollateralHoldId?: string;
  timeoutAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelledReason?: string;
  disputedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const SwapSessionSchema = new Schema<ISwapSession>({
  _id: { type: String },
  id: { type: String, required: true },
  tradeOfferId: { type: String },
  initiatorId: { type: String },
  receiverId: { type: String },
  status: { type: String, enum: SwapSessionStatus, default: 'PENDING' },
  shipmentMode: { type: String },
  shipments: { type: Schema.Types.Mixed },
  escrowId: { type: String },
  collateralAmount: { type: Types.Decimal128 },
  collateralCurrency: { type: String, default: 'TRY' },
  collateralStatus: { type: String, enum: CollateralStatus, default: 'NONE' },
  collateralLockedAt: { type: Date },
  collateralReleasedAt: { type: Date },
  collateralForfeitedAt: { type: Date },
  fromCollateralHoldId: { type: String },
  toCollateralHoldId: { type: String },
  timeoutAt: { type: Date },
  completedAt: { type: Date },
  cancelledAt: { type: Date },
  cancelledReason: { type: String },
  disputedAt: { type: Date },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'barter_swap_sessions',
});

SwapSessionSchema.index({ receiverId: 1 });
SwapSessionSchema.index({ initiatorId: 1 });
SwapSessionSchema.index({ tradeOfferId: 1 });
SwapSessionSchema.index({ status: 1, timeoutAt: 1 });
SwapSessionSchema.index({ timeoutAt: 1 }, { expireAfterSeconds: 0 }); // TTL — otomatik silme

export const SwapSession = model<ISwapSession>('SwapSession', SwapSessionSchema);