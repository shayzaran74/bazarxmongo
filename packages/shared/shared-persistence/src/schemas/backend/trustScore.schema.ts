import { Schema, model, Types } from 'mongoose';

export const TrustLevel = ['GOOD','FAIR','POOR','SUSPENDED','FROZEN'] as const;
export type TrustLevelType = typeof TrustLevel[number];

export interface ITrustScore {
  _id?: string;
  id: string;
  vendorId: string;
  score: Types.Decimal128;
  tradingPerformance: Types.Decimal128;
  xpLoyalty: Types.Decimal128;
  compliance: Types.Decimal128;
  level: TrustLevelType;
  lastCalculatedAt: Date;
  isFrozen: boolean;
  violationCount: number;
  inactiveDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export const TrustScoreSchema = new Schema<ITrustScore>({
  _id: { type: String },
  id: { type: String, required: true },
  vendorId: { type: String },
  score: { type: Types.Decimal128, default: 100 },
  tradingPerformance: { type: Types.Decimal128, default: 100 },
  xpLoyalty: { type: Types.Decimal128, default: 100 },
  compliance: { type: Types.Decimal128, default: 100 },
  level: { type: String, enum: TrustLevel, default: 'GOOD' },
  lastCalculatedAt: { type: Date },
  isFrozen: { type: Boolean, default: false },
  violationCount: { type: Number, default: 0 },
  inactiveDays: { type: Number, default: 0 },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'trust_scores',
});

TrustScoreSchema.index({ vendorId: 1 }, { unique: true });
TrustScoreSchema.index({ isFrozen: 1 });
TrustScoreSchema.index({ level: 1 });

export const TrustScore = model<ITrustScore>('TrustScore', TrustScoreSchema);