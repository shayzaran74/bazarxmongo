// apps/backend/src/modules/vendor/infrastructure/persistence/schemas/ecosystemOrder.schema.ts

import { createModelProxy } from '@barterborsa/shared-persistence/mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

export interface IEcosystemOrder {
  _id?: string;
  dealerId: Types.ObjectId;
  ecosystemId: Types.ObjectId;
  productId: Types.ObjectId;
  orderId: Types.ObjectId;
  quantity: number;
  unitPrice: Types.Decimal128;
  isGarageSale: boolean;
  garageSaleId?: Types.ObjectId;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

export const EcosystemOrderSchema = new Schema<IEcosystemOrder>(
  {
    _id: { type: String },
    dealerId: { type: Schema.Types.ObjectId, required: true },
    ecosystemId: { type: Schema.Types.ObjectId, required: true },
    productId: { type: Schema.Types.ObjectId, required: true },
    orderId: { type: Schema.Types.ObjectId, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Schema.Types.Decimal128, required: true },
    isGarageSale: { type: Boolean, default: false },
    garageSaleId: { type: Schema.Types.ObjectId },
    status: { type: String, enum: ['PENDING', 'CONFIRMED', 'CANCELLED'], default: 'PENDING' },
  },
  {
    timestamps: true,
    collection: 'ecosystem_orders',
  },
);

// Indexes
EcosystemOrderSchema.index({ dealerId: 1, productId: 1 }); // Watchover aggregate
EcosystemOrderSchema.index({ ecosystemId: 1, createdAt: -1 }); // Factory dashboard
EcosystemOrderSchema.index({ garageSaleId: 1 }, { sparse: true }); // GarageSale orders
EcosystemOrderSchema.index({ orderId: 1 }, { unique: true }); // One Order = one EcosystemOrder

export const EcosystemOrder =
  createModelProxy<IEcosystemOrder>('EcosystemOrder', EcosystemOrderSchema);