import { Schema, model, Types } from 'mongoose';

export interface IMenuUsage {
  _id?: string;
  id: string;
  subscriptionId: string;
  month: number;
  year: number;
  usedCredit: Types.Decimal128;
  totalCredit: Types.Decimal128;
}

export const MenuUsageSchema = new Schema<IMenuUsage>({
  _id: { type: String },
  id: { type: String, required: true },
  subscriptionId: { type: String },
  month: { type: Number },
  year: { type: Number },
  usedCredit: { type: Types.Decimal128, default: 0 },
  totalCredit: { type: Types.Decimal128 },
}, {
  timestamps: true,
  collection: 'menu_usages',
});

MenuUsageSchema.index({ subscriptionId: 1, month: 1, year: 1 }, { unique: true });

export const MenuUsage = model<IMenuUsage>('MenuUsage', MenuUsageSchema);