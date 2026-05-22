import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

export const CommissionStatus = ['CALCULATED','PENDING','COLLECTED','WAIVED'] as const;
export type CommissionStatusType = typeof CommissionStatus[number];

export const CommissionType = ['ORDER','BARTER','ADVERTISING','SUBSCRIPTION'] as const;
export type CommissionTypeType = typeof CommissionType[number];

export interface ICommissionRecord {
  _id?: string;
  id: string;
  orderId?: string;
  tradeOfferId?: string;
  vendorId: string;
  vendorTier: string;
  baseAmount: Types.Decimal128;
  commissionRate: Types.Decimal128;
  commissionAmount: Types.Decimal128;
  commissionType: CommissionTypeType;
  status: CommissionStatusType;
  collectedAt?: Date;
  createdAt: Date;
  idempotencyKey?: string;
}

export const CommissionRecordSchema = new Schema<ICommissionRecord>({
  _id: { type: String },
  id: { type: String, required: true },
  orderId: { type: String },
  tradeOfferId: { type: String },
  vendorId: { type: String },
  vendorTier: { type: String },
  baseAmount: { type: Types.Decimal128 },
  commissionRate: { type: Types.Decimal128 },
  commissionAmount: { type: Types.Decimal128 },
  commissionType: { type: String, enum: CommissionType },
  status: { type: String, enum: CommissionStatus, default: 'CALCULATED' },
  collectedAt: { type: Date },
  createdAt: { type: Date },
  idempotencyKey: { type: String },
}, {
  timestamps: true,
  collection: 'commission_records',
});

CommissionRecordSchema.index({ vendorId: 1 });
CommissionRecordSchema.index({ orderId: 1 });
CommissionRecordSchema.index({ tradeOfferId: 1 });
CommissionRecordSchema.index({ status: 1 });
CommissionRecordSchema.index({ vendorId: 1, status: 1 });
CommissionRecordSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

export const CommissionRecord = createModelProxy<ICommissionRecord>('CommissionRecord', CommissionRecordSchema);