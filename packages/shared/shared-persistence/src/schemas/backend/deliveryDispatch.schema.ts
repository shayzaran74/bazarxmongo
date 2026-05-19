// packages/shared/shared-persistence/src/schemas/backend/deliveryDispatch.schema.ts
import { Schema, model } from 'mongoose';

// DispatchStatus — aligned with domain enum (DispatchStatus)
export const DispatchStatusValues = ['PENDING_ASSIGN','ASSIGNED','PICKED_UP','DELIVERED','CANCELLED'] as const;
export type DispatchStatusType = typeof DispatchStatusValues[number];

export interface IDeliveryDispatch {
  _id?: string;
  id: string;
  orderId: string;
  courierId?: string;
  status: DispatchStatusType;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  recipientName?: string;
  recipientPhone?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const DeliveryDispatchSchema = new Schema<IDeliveryDispatch>({
  _id: { type: String },
  id: { type: String, required: true },
  orderId: { type: String },
  courierId: { type: String },
  status: { type: String, enum: DispatchStatusValues, default: 'PENDING_ASSIGN' },
  pickedUpAt: { type: Date },
  deliveredAt: { type: Date },
  recipientName: { type: String },
  recipientPhone: { type: String },
  notes: { type: String },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'delivery_dispatches',
});

DeliveryDispatchSchema.index({ orderId: 1 });
DeliveryDispatchSchema.index({ courierId: 1 });
DeliveryDispatchSchema.index({ status: 1 });

export const DeliveryDispatch = model<IDeliveryDispatch>('DeliveryDispatch', DeliveryDispatchSchema);