import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// Warehouse — generated from Prisma schema
// TODO: strict typing — codegen

export interface IWarehouse {
  _id?: string;
  id: string;
  vendorId: string;
  name: string;
  address?: string;
  city?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const WarehouseSchema = new Schema<IWarehouse>({
  _id: { type: String },
  id: { type: String, required: true },
  vendorId: { type: String, alias: 'vendor_id' },
  name: { type: String },
  address: { type: String },
  city: { type: String },
  isDefault: { type: Boolean, default: false, alias: 'is_default' },
  isActive: { type: Boolean, default: true, alias: 'is_active' },
  createdAt: { type: Date, alias: 'created_at' },
  updatedAt: { type: Date, alias: 'updated_at' },
}, {
  timestamps: true,
  collection: 'warehouses',
});

// Composite index
WarehouseSchema.index({ vendorId: 1 });

export const Warehouse = createModelProxy<IWarehouse>('Warehouse', WarehouseSchema);
