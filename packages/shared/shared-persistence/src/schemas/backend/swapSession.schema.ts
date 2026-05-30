import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

export const CollateralStatus = ['NONE','DEPOSITED','HELD','RELEASED','FORFEITED'] as const;
export type CollateralStatusType = typeof CollateralStatus[number];

// Barter komisyon durumu (Master Plan §3/§6) — accept'te HELD, tamamlanınca CAPTURED (Faz 2)
export const CommissionStatus = ['NONE','HELD','PARTIALLY_CAPTURED','CAPTURED','REFUNDED'] as const;
export type CommissionStatusType = typeof CommissionStatus[number];

export const ShipmentMode = ['STANDARD','CARRIER','HAND_DELIVERY','DIGITAL'] as const;
export type ShipmentModeType = typeof ShipmentMode[number];

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
  shipmentMode: ShipmentModeType;
  shipments?: Record<string, unknown>[];
  escrowId?: string;
  collateralAmount: Types.Decimal128;
  collateralCurrency: string;
  collateralStatus: CollateralStatusType;
  collateralLockedAt?: Date;
  collateralReleasedAt?: Date;
  collateralForfeitedAt?: Date;
  fromCollateralHoldId?: string;
  toCollateralHoldId?: string;
  initiatorHoldId?: string;    // holdFunds response — accept-trade-offer set eder
  receiverHoldId?: string;    // holdFunds response — accept-trade-offer set eder
  // ─── Barter komisyonu (Master Plan §3/§6) ───────────────────────────────
  offeredValue?: Types.Decimal128;         // teklif edilen malların toplam değeri (receiver'ın aldığı)
  requestedValue?: Types.Decimal128;       // istenen malların toplam değeri (initiator'ın aldığı)
  cashAmount?: Types.Decimal128;           // takastaki nakit fark
  cashDirection?: string;                  // TO_INITIATOR | TO_RECEIVER
  fromCommissionAmount?: Types.Decimal128; // initiator'ın nakit komisyonu (tam, ratio uygulanmadan)
  toCommissionAmount?: Types.Decimal128;   // receiver'ın nakit komisyonu
  fromCommissionHoldId?: string;           // initiator komisyon blokaj ID (sellerId=PLATFORM)
  toCommissionHoldId?: string;             // receiver komisyon blokaj ID
  fromXpCommission?: Types.Decimal128;     // initiator'ın XP komisyon kısmı (Faz 2)
  toXpCommission?: Types.Decimal128;       // receiver'ın XP komisyon kısmı (Faz 2)
  commissionStatus?: CommissionStatusType; // NONE | HELD | PARTIALLY_CAPTURED | CAPTURED | REFUNDED
  commissionRateType?: string;             // STANDARD | GROUP | XP_DISCOUNTED
  pendingReleaseAt?: Date;     // finalize-swap anında set edilir — SLA scheduler referansı
  autoReleasedAt?: Date;       // scheduler tarafından set edilir
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
  shipmentMode: { type: String, enum: ShipmentMode, default: 'STANDARD' },
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
  initiatorHoldId: { type: String },
  receiverHoldId: { type: String },
  // ─── Barter komisyonu ───────────────────────────────────────────────────
  offeredValue: { type: Types.Decimal128 },
  requestedValue: { type: Types.Decimal128 },
  cashAmount: { type: Types.Decimal128 },
  cashDirection: { type: String },
  fromCommissionAmount: { type: Types.Decimal128 },
  toCommissionAmount: { type: Types.Decimal128 },
  fromCommissionHoldId: { type: String },
  toCommissionHoldId: { type: String },
  fromXpCommission: { type: Types.Decimal128 },
  toXpCommission: { type: Types.Decimal128 },
  commissionStatus: { type: String, enum: CommissionStatus, default: 'NONE' },
  commissionRateType: { type: String },
  pendingReleaseAt: { type: Date },
  autoReleasedAt: { type: Date },
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
SwapSessionSchema.index({ status: 1, pendingReleaseAt: 1 }); // SLA auto-release
SwapSessionSchema.index({ timeoutAt: 1 }, { expireAfterSeconds: 0 }); // TTL — otomatik silme

export const SwapSession = createModelProxy<ISwapSession>('SwapSession', SwapSessionSchema);