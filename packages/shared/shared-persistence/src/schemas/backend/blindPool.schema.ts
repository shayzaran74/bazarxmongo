import { Schema, model, Types } from 'mongoose';

export interface IBlindPool {
  _id?: string;
  id: string;
  groupId: string;
  name: string;
  totalStock: Types.Decimal128;
  availableStock: Types.Decimal128;
  smartCapPct: Types.Decimal128;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const BlindPoolSchema = new Schema<IBlindPool>({
  _id: { type: String },
  id: { type: String, required: true },
  groupId: { type: String },
  name: { type: String },
  totalStock: { type: Types.Decimal128 },
  availableStock: { type: Types.Decimal128 },
  smartCapPct: { type: Types.Decimal128, default: 25 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'blind_pools',
});

BlindPoolSchema.index({ groupId: 1 });
BlindPoolSchema.index({ isActive: 1 });

export const BlindPool = model<IBlindPool>('BlindPool', BlindPoolSchema);