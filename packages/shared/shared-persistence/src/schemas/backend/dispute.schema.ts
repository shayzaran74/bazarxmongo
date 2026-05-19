// packages/shared/shared-persistence/src/schemas/backend/dispute.schema.ts
import { Schema, model } from 'mongoose';

export const DisputeStatus = ['OPEN','REVIEWING','RESOLVED','CLOSED'] as const;
export type DisputeStatusType = typeof DisputeStatus[number];

export const DisputeResolutionType = ['REFUND','REPLACEMENT','NO_REFUND'] as const;
export type DisputeResolutionTypeType = typeof DisputeResolutionType[number];

export interface IDispute {
  _id?: string;
  id: string;
  orderId: string;
  userId: string;
  vendorId: string;
  reason: string;
  description?: string;
  status: DisputeStatusType;
  adminNote?: string;
  resolutionType?: DisputeResolutionTypeType;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const DisputeSchema = new Schema<IDispute>({
  _id: { type: String },
  id: { type: String, required: true },
  orderId: { type: String },
  userId: { type: String },
  vendorId: { type: String },
  reason: { type: String },
  description: { type: String },
  status: { type: String, enum: DisputeStatus, default: 'OPEN' },
  adminNote: { type: String },
  resolutionType: { type: String, enum: DisputeResolutionType },
  resolvedAt: { type: Date },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'disputes',
});

DisputeSchema.index({ status: 1 });
DisputeSchema.index({ userId: 1 });
DisputeSchema.index({ vendorId: 1 });
DisputeSchema.index({ orderId: 1 });

export const Dispute = model<IDispute>('Dispute', DisputeSchema);