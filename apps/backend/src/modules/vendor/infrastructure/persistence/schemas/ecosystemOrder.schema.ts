// apps/backend/src/modules/vendor/infrastructure/persistence/schemas/ecosystemOrder.schema.ts

import { createModelProxy } from '@barterborsa/shared-persistence/mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

export interface IEcosystemOrder {
  _id?: string;
  dealerId: string;
  ecosystemId: string;
  productId: string;
  orderId: string;
  quantity: number;
  unitPrice: Types.Decimal128;
  isGarageSale: boolean;
  garageSaleId?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

export const EcosystemOrderSchema = new Schema<IEcosystemOrder>(
  {
    _id: { type: String },
    dealerId: { type: String, required: true },
    ecosystemId: { type: String, required: true },
    productId: { type: String, required: true },
    orderId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Schema.Types.Decimal128, required: true },
    isGarageSale: { type: Boolean, default: false },
    garageSaleId: { type: String },
    status: { type: String, enum: ['PENDING', 'CONFIRMED', 'CANCELLED'], default: 'PENDING' },
  },
  {
    timestamps: true,
    collection: 'ecosystem_orders',
  },
);

// Indexes
EcosystemOrderSchema.index({ dealerId: 1, productId: 1 }); // Watchover aggregate
EcosystemOrderSchema.index({ dealerId: 1, productId: 1, status: 1 }); // Watchover kota sorgusu
EcosystemOrderSchema.index({ garageSaleId: 1, dealerId: 1, status: 1 }); // GarageSale dealer kota
EcosystemOrderSchema.index({ ecosystemId: 1, createdAt: -1 }); // Factory dashboard
EcosystemOrderSchema.index({ garageSaleId: 1 }, { sparse: true }); // GarageSale orders
EcosystemOrderSchema.index({ orderId: 1 }, { unique: true }); // One Order = one EcosystemOrder

export const EcosystemOrder =
  createModelProxy<IEcosystemOrder>('EcosystemOrder', EcosystemOrderSchema);