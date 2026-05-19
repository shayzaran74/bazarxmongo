import { Schema, model, Types } from 'mongoose';

// Transfer — generated from Prisma schema
// TODO: strict typing — codegen

export interface ITransfer {
  _id?: string;
  id: string;
  vendorId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  transferNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const TransferSchema = new Schema<ITransfer>({
  _id: { type: String },
  id: { type: String, required: true },
  vendorId: { type: String, alias: 'vendor_id' },
  fromWarehouseId: { type: String, alias: 'from_warehouse_id' },
  toWarehouseId: { type: String, alias: 'to_warehouse_id' },
  transferNumber: { type: String, alias: 'transfer_number' },
  notes: { type: String },
  createdAt: { type: Date, alias: 'created_at' },
  updatedAt: { type: Date, alias: 'updated_at' },
}, {
  timestamps: true,
  collection: 'transfers',
});

// Composite index
TransferSchema.index({ vendorId: 1 });

export const Transfer = model<ITransfer>('Transfer', TransferSchema);
