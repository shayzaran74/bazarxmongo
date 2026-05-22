import { createModelProxy } from '../../mongodb/model-proxy';
// packages/shared/shared-persistence/src/schemas/backend/menuPurchase.schema.ts

import { Schema, Types } from 'mongoose';

export const MenuPurchaseStatus = [
  'PENDING', 'ACTIVE', 'PARTIALLY_REDEEMED', 'REDEEMED',
  'COMPLETED', 'REFUNDED', 'EXPIRED', 'CANCELLED', 'TRANSFERRED',
] as const;
export type MenuPurchaseStatusType = typeof MenuPurchaseStatus[number];

export interface IMenuPurchase {
  _id?: string;
  id: string;
  userId: string;
  listingId: string;
  subscriptionId?: string;
  status: MenuPurchaseStatusType;
  paidAmount: Types.Decimal128;
  serviceFee: Types.Decimal128;
  vatAmount: Types.Decimal128;
  // Ana QR (menü hakkı)
  qrCode: string;
  qrExpiresAt: Date;
  qrUsedAt?: Date;
  // 1+1 bedava QR
  oneFreeQrCode?: string;
  oneFreeActivatedAt?: Date;
  oneFreeUsedAt?: Date;
  // Menü devir alanları (§4 Menü Devir Hakkı)
  isTransferred: boolean;
  transferredTo?: string;     // alıcı userId
  transferredFrom?: string;   // kaynak purchaseId (bu bir devir alınmış kayıtsa)
  transferredAt?: Date;
  // XP ve metadata
  xpEarned: number;
  menuCategory?: number;      // 1-6 kategori numarası
  createdAt: Date;
  updatedAt: Date;
}

export const MenuPurchaseSchema = new Schema<IMenuPurchase>({
  _id:                { type: String },
  id:                 { type: String, required: true },
  userId:             { type: String },
  listingId:          { type: String },
  subscriptionId:     { type: String },
  status:             { type: String, enum: MenuPurchaseStatus, default: 'ACTIVE' },
  paidAmount:         { type: Types.Decimal128 },
  serviceFee:         { type: Types.Decimal128 },
  vatAmount:          { type: Types.Decimal128 },
  qrCode:             { type: String },
  qrExpiresAt:        { type: Date },
  qrUsedAt:           { type: Date },
  oneFreeQrCode:      { type: String },
  oneFreeActivatedAt: { type: Date },
  oneFreeUsedAt:      { type: Date },
  isTransferred:      { type: Boolean, default: false },
  transferredTo:      { type: String },
  transferredFrom:    { type: String },
  transferredAt:      { type: Date },
  xpEarned:           { type: Number, default: 0 },
  menuCategory:       { type: Number, min: 1, max: 6 },
  createdAt:          { type: Date },
  updatedAt:          { type: Date },
}, {
  timestamps: true,
  collection: 'menu_purchases',
});

MenuPurchaseSchema.index({ userId: 1, status: 1 });
MenuPurchaseSchema.index({ listingId: 1 });
MenuPurchaseSchema.index({ status: 1, qrExpiresAt: 1 });
MenuPurchaseSchema.index({ qrCode: 1 }, { unique: true });
MenuPurchaseSchema.index({ oneFreeQrCode: 1 }, { sparse: true });
MenuPurchaseSchema.index({ transferredTo: 1 });

export const MenuPurchase = createModelProxy<IMenuPurchase>('MenuPurchase', MenuPurchaseSchema);
