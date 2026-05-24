// packages/shared/shared-persistence/src/schemas/backend/cargoShipment.schema.ts

import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema } from 'mongoose';

export const CargoShipmentStatus = [
  'CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY',
  'DELIVERED', 'RETURNED', 'FAILED', 'CANCELLED',
] as const;
export type CargoShipmentStatusType = typeof CargoShipmentStatus[number];

export interface ICargoShipment {
  _id?: string;
  id: string;
  orderId: string;
  vendorId: string;
  provider: string;
  trackingNumber: string;
  status: CargoShipmentStatusType;
  lastPolledAt?: Date;
  deliveredAt?: Date;
  statusHistory?: Array<{ status: string; timestamp: Date; rawData?: string }>;
  createdAt: Date;
  updatedAt: Date;
}

export const CargoShipmentSchema = new Schema<ICargoShipment>({
  _id: { type: String },
  id: { type: String, required: true },
  orderId: { type: String, required: true },
  vendorId: { type: String, required: true },
  provider: { type: String, required: true, enum: ['MNG_KARGO', 'YURTICI_KARGO', 'SURAT_KARGO', 'TEX_KARGO'] },
  trackingNumber: { type: String, required: true },
  status: { type: String, enum: CargoShipmentStatus, default: 'CREATED' },
  lastPolledAt: { type: Date },
  deliveredAt: { type: Date },
  statusHistory: [{ status: String, timestamp: Date, rawData: String }],
}, {
  timestamps: true,
  collection: 'cargo_shipments',
});

CargoShipmentSchema.index({ orderId: 1 });
CargoShipmentSchema.index({ vendorId: 1 });
CargoShipmentSchema.index({ status: 1 });
CargoShipmentSchema.index({ trackingNumber: 1, provider: 1 }, { unique: true });

export const CargoShipment = createModelProxy<ICargoShipment>('CargoShipment', CargoShipmentSchema);
