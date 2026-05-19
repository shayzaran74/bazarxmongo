import { Schema, model, Types } from 'mongoose';

export const TradeOfferStatus = ['PENDING','ACCEPTED','REJECTED','COUNTER_OFFERED','COMPLETED','CANCELLED','EXPIRED'] as const;
export type TradeOfferStatusType = typeof TradeOfferStatus[number];

export const CashDirection = ['NONE',' initiator_to_receiver','receiver_to_initiator','BOTH'] as const;
export type CashDirectionType = typeof CashDirection[number];

export interface ITradeOffer {
  _id?: string;
  id: string;
  tradeOfferId: string;
  initiatorId: string;
  receiverId: string;
  fromCompanyId?: string;
  toCompanyId?: string;
  status: TradeOfferStatusType;
  offeredItemId?: string;
  requestedItemId?: string;
  cashAmount: Types.Decimal128;
  cashDirection: CashDirectionType;
  cashCurrency: string;
  message?: string;
  chainId?: string;
  parentOfferId?: string;
  counterOfferId?: string;
  legalAcceptedAt?: Date;
  downPaymentHoldId?: string;
  acceptedAt?: Date;
  rejectedAt?: Date;
  cancelledAt?: Date;
  completedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const TradeOfferSchema = new Schema<ITradeOffer>({
  _id: { type: String },
  id: { type: String, required: true },
  tradeOfferId: { type: String }, // alias for id
  initiatorId: { type: String },
  receiverId: { type: String },
  fromCompanyId: { type: String },
  toCompanyId: { type: String },
  status: { type: String, enum: TradeOfferStatus, default: 'PENDING' },
  offeredItemId: { type: String },
  requestedItemId: { type: String },
  cashAmount: { type: Types.Decimal128 },
  cashDirection: { type: String, enum: CashDirection, default: 'NONE' },
  cashCurrency: { type: String, default: 'TRY' },
  message: { type: String },
  chainId: { type: String },
  parentOfferId: { type: String },
  counterOfferId: { type: String },
  legalAcceptedAt: { type: Date },
  downPaymentHoldId: { type: String },
  acceptedAt: { type: Date },
  rejectedAt: { type: Date },
  cancelledAt: { type: Date },
  completedAt: { type: Date },
  expiresAt: { type: Date },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'trade_offers',
});

TradeOfferSchema.index({ fromCompanyId: 1 });
TradeOfferSchema.index({ toCompanyId: 1 });
TradeOfferSchema.index({ initiatorId: 1 });
TradeOfferSchema.index({ status: 1, expiresAt: 1 });
TradeOfferSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL — otomatik silme

export const TradeOffer = model<ITradeOffer>('TradeOffer', TradeOfferSchema);