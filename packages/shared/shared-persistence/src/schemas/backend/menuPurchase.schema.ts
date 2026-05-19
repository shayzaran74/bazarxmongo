import { Schema, model, Types } from 'mongoose';

export const MenuPurchaseStatus = ['PENDING','ACTIVE','PARTIALLY_REDEEMED','REDEEMED','COMPLETED','REFUNDED','EXPIRED','CANCELLED'] as const;
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
  qrCode: string;
  qrExpiresAt: Date;
  oneFreeQrCode?: string;
  oneFreeActivatedAt?: Date;
  oneFreeUsedAt?: Date;
  xpEarned: number;
  createdAt: Date;
  updatedAt: Date;
}

export const MenuPurchaseSchema = new Schema<IMenuPurchase>({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String },
  listingId: { type: String },
  subscriptionId: { type: String },
  status: { type: String, enum: MenuPurchaseStatus, default: 'PENDING' },
  paidAmount: { type: Types.Decimal128 },
  serviceFee: { type: Types.Decimal128 },
  vatAmount: { type: Types.Decimal128 },
  qrCode: { type: String },
  qrExpiresAt: { type: Date },
  oneFreeQrCode: { type: String },
  oneFreeActivatedAt: { type: Date },
  oneFreeUsedAt: { type: Date },
  xpEarned: { type: Number, default: 0 },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'menu_purchases',
});

MenuPurchaseSchema.index({ userId: 1 });
MenuPurchaseSchema.index({ listingId: 1 });
MenuPurchaseSchema.index({ status: 1 });
MenuPurchaseSchema.index({ qrCode: 1 }, { unique: true });

export const MenuPurchase = model<IMenuPurchase>('MenuPurchase', MenuPurchaseSchema);