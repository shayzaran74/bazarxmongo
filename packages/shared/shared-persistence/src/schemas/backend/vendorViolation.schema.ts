import { Schema, model, Types } from 'mongoose';

export const VendorViolationLevel = ['WARNING', 'PENALTY', 'FREEZE'] as const;
export type VendorViolationLevelType = typeof VendorViolationLevel[number];

export interface IVendorViolation {
  _id?: string;
  id: string;
  vendorId: string;
  type: string; // VendorViolationType enum değeri
  severity: VendorViolationLevelType;
  description: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  penaltyScore?: number;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const VendorViolationSchema = new Schema<IVendorViolation>({
  _id: { type: String },
  id: { type: String, required: true },
  vendorId: { type: String },
  type: { type: String },
  severity: { type: String, enum: VendorViolationLevel, default: 'WARNING' },
  description: { type: String },
  relatedEntityId: { type: String },
  relatedEntityType: { type: String },
  penaltyScore: { type: Number },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'vendor_violations',
});

VendorViolationSchema.index({ vendorId: 1, isActive: 1 });
VendorViolationSchema.index({ vendorId: 1, type: 1 });
VendorViolationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL — süresi dolanı otomatik sil

export const VendorViolationModel = model<IVendorViolation>('VendorViolation', VendorViolationSchema);