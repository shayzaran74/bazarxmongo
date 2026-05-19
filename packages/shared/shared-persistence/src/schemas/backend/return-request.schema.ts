// packages/shared/shared-persistence/src/schemas/backend/return-request.schema.ts
// ReturnRequest MongoDB schema — Master Plan §3.7
// 14 gün iade, 48s satıcı timeout, 96s oto onay

import { Schema, model, Types } from 'mongoose';

export const ReturnReasonType = ['DEFECTIVE', 'WRONG_ITEM', 'NOT_AS_DESCRIBED', 'CHANGED_MIND', 'ARRIVED_LATE', 'OTHER'] as const;
export type ReturnReasonTypeType = typeof ReturnReasonType[number];

export const ReturnStatus = ['PENDING', 'APPROVED', 'REJECTED', 'AUTO_APPROVED', 'CANCELLED'] as const;
export type ReturnStatusType = typeof ReturnStatus[number];

// Embedded ReturnItem
export interface IReturnItem {
  id: string;
  orderItemId: string;
  quantity: number;
  refundAmount: Types.Decimal128;
  reason?: string;
}

export interface IReturnRequest {
  _id?: string;
  id: string;
  orderId: string;
  userId: string;
  status: ReturnStatusType;
  reason: string;
  reasonType: ReturnReasonTypeType;
  items: IReturnItem[];
  totalRefund: Types.Decimal128;
  sellerId: string;
  sellerDeadlineAt: Date;    // 48 saat sonra
  autoApproveAt: Date;       // 96 saat sonra (satici onaylamazsa)
  createdAt: Date;
  updatedAt: Date;
}

const ReturnItemSchema = new Schema<IReturnItem>({
  id: { type: String, required: true },
  orderItemId: { type: String },
  quantity: { type: Number },
  refundAmount: { type: Types.Decimal128 },
  reason: { type: String },
}, { _id: false });

export const ReturnRequestSchema = new Schema<IReturnRequest>({
  _id: { type: String },
  id: { type: String, required: true },
  orderId: { type: String },
  userId: { type: String },
  status: { type: String, enum: ReturnStatus, default: 'PENDING' },
  reason: { type: String },
  reasonType: { type: String, enum: ReturnReasonType },
  items: { type: [ReturnItemSchema], default: [] },
  totalRefund: { type: Types.Decimal128 },
  sellerId: { type: String },
  sellerDeadlineAt: { type: Date },
  autoApproveAt: { type: Date },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'return_requests',
});

ReturnRequestSchema.index({ orderId: 1 });
ReturnRequestSchema.index({ status: 1 });
ReturnRequestSchema.index({ sellerId: 1, status: 1 });
ReturnRequestSchema.index({ sellerDeadlineAt: 1 }, { expireAfterSeconds: 0 }); // TTL — süresi dolanı otomatik sil

export const ReturnRequest = model<IReturnRequest>('ReturnRequest', ReturnRequestSchema);