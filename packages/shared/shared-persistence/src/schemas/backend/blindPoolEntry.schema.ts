import { Schema, model, Types } from 'mongoose';

export interface IBlindPoolEntry {
  _id?: string;
  id: string;
  poolId: string;
  vendorId: string;
  listingId: string;
  quantity: Types.Decimal128;
  isReserved: boolean;
  createdAt: Date;
}

export const BlindPoolEntrySchema = new Schema<IBlindPoolEntry>({
  _id: { type: String },
  id: { type: String, required: true },
  poolId: { type: String },
  vendorId: { type: String },
  listingId: { type: String },
  quantity: { type: Types.Decimal128 },
  isReserved: { type: Boolean, default: false },
  createdAt: { type: Date },
}, {
  timestamps: true,
  collection: 'blind_pool_entries',
});

BlindPoolEntrySchema.index({ poolId: 1 });
BlindPoolEntrySchema.index({ listingId: 1 });
BlindPoolEntrySchema.index({ vendorId: 1 });

export const BlindPoolEntry = model<IBlindPoolEntry>('BlindPoolEntry', BlindPoolEntrySchema);