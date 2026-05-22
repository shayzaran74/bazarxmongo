import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema } from 'mongoose';

export const InventoryLogType = ['SALE','PURCHASE','RESERVE','RELEASE','RETURN','ADJUSTMENT','EXPIRY','TRANSFER'] as const;
export type InventoryLogTypeType = typeof InventoryLogType[number];

export interface IInventoryLog {
  _id?: string;
  id: string;
  vendorId: string;
  listingId: string;
  quantity: number;
  type: InventoryLogTypeType;
  reason?: string;
  referenceType?: string;
  referenceId?: string;
  createdAt: Date;
}

export const InventoryLogSchema = new Schema<IInventoryLog>({
  _id: { type: String },
  id: { type: String, required: true },
  vendorId: { type: String },
  listingId: { type: String },
  quantity: { type: Number },
  type: { type: String, enum: InventoryLogType },
  reason: { type: String },
  referenceType: { type: String },
  referenceId: { type: String },
  createdAt: { type: Date },
}, {
  timestamps: true,
  collection: 'inventory_logs',
});

InventoryLogSchema.index({ vendorId: 1 });
InventoryLogSchema.index({ listingId: 1 });
InventoryLogSchema.index({ createdAt: -1 });
InventoryLogSchema.index({ type: 1, createdAt: -1 });

export const InventoryLog = createModelProxy<IInventoryLog>('InventoryLog', InventoryLogSchema);