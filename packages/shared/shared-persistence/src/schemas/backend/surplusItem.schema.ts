import { Schema, model, Types } from 'mongoose';

export const SurplusStatus = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'UPDATED',
  'REACTIVATED',
  'PENDING_APPROVAL',
  'ACTIVE',
  'RESERVED',
  'TRADED',
  'EXPIRED',
  'DEACTIVATED'
] as const;
export type SurplusStatusType = typeof SurplusStatus[number];

export interface ISurplusItem {
  _id?: string;
  id: string;
  companyId: string;
  status: SurplusStatusType;
  title: string;
  description?: string;
  category: string;
  materialType?: string;
  quantity: Types.Decimal128;
  blockedQuantity: Types.Decimal128;
  unit: string;
  minTradeQuantity?: Types.Decimal128;
  unitPrice?: Types.Decimal128;
  wantedCategories?: Schema.Types.Mixed;
  tradeModes?: Schema.Types.Mixed;
  technicalSpecs?: Schema.Types.Mixed;
  images?: Schema.Types.Mixed;
  location?: string;
  city?: string;
  reactivationCount: number;
  lastReactivatedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
  latitude?: number;
  longitude?: number;
  metadata?: Schema.Types.Mixed;
  createdAt: Date;
  updatedAt: Date;
}

export const SurplusItemSchema = new Schema<ISurplusItem>({
  _id: { type: String },
  id: { type: String, required: true },
  companyId: { type: String },
  status: { type: String, enum: SurplusStatus, default: 'PENDING' },
  title: { type: String },
  description: { type: String },
  category: { type: String },
  materialType: { type: String },
  quantity: { type: Types.Decimal128 },
  blockedQuantity: { type: Types.Decimal128, default: 0 },
  unit: { type: String },
  minTradeQuantity: { type: Types.Decimal128 },
  unitPrice: { type: Types.Decimal128 },
  wantedCategories: { type: Schema.Types.Mixed },
  tradeModes: { type: Schema.Types.Mixed },
  technicalSpecs: { type: Schema.Types.Mixed },
  images: { type: Schema.Types.Mixed },
  location: { type: String },
  city: { type: String },
  reactivationCount: { type: Number, default: 0 },
  lastReactivatedAt: { type: Date },
  approvedBy: { type: String },
  rejectionReason: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'surplus_items',
});

SurplusItemSchema.index({ city: 1 });
SurplusItemSchema.index({ city: 1, status: 1 });
SurplusItemSchema.index({ companyId: 1 });
SurplusItemSchema.index({ status: 1 });

export const SurplusItem = model<ISurplusItem>('SurplusItem', SurplusItemSchema);