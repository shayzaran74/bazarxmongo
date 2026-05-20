// packages/shared/shared-persistence/src/schemas/backend/menuRight.schema.ts
// Master Plan v4.3 §2.2 + §2.7 — Kullanıcının BazarX Menü Hakkı (aidat × 2).
// Tier yükseldiğinde yeni hak verilir; tier düştüğünde eski haklar 30 gün daha geçerli kalır.

import { Schema, model, Types } from 'mongoose';

// MenuRight kayıt nedeni — upgrade vs downgrade grace
export const MenuRightSource = ['UPGRADE', 'DOWNGRADE_GRACE', 'INITIAL', 'TRIAL'] as const;
export type MenuRightSourceType = typeof MenuRightSource[number];

// Master Plan §2.1 — 8 tier
export const MenuRightTier = [
  'BRONZE_P1', 'BRONZE_P2', 'SILVER_P1', 'SILVER_P2',
  'GOLD_P1', 'GOLD_P2', 'DIAMOND_P1', 'DIAMOND_P2',
] as const;
export type MenuRightTierType = typeof MenuRightTier[number];

export interface IMenuRight {
  _id?: string;
  id: string;
  userId: string;
  tier: MenuRightTierType;
  // aidat × 2 (Master Plan §2.2) — kalan bütçe
  totalAllowance: Types.Decimal128;
  usedAllowance: Types.Decimal128;
  remainingAllowance: Types.Decimal128;
  // Kullanıcı bu hakkı 1+1 menü için aktive etti mi (§2.2)
  oneFreeActivatedAt?: Date;
  oneFreeUsedAt?: Date;
  source: MenuRightSourceType;
  // Hakkın geçerlilik süresi (downgrade grace için 30 gün, normal için aboneliğin bitişi)
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const MenuRightSchema = new Schema<IMenuRight>({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String, required: true, alias: 'user_id' },
  tier: { type: String, enum: MenuRightTier, required: true },
  totalAllowance: { type: Types.Decimal128, required: true, alias: 'total_allowance' },
  usedAllowance: { type: Types.Decimal128, default: '0', alias: 'used_allowance' },
  remainingAllowance: { type: Types.Decimal128, required: true, alias: 'remaining_allowance' },
  oneFreeActivatedAt: { type: Date, alias: 'one_free_activated_at' },
  oneFreeUsedAt: { type: Date, alias: 'one_free_used_at' },
  source: { type: String, enum: MenuRightSource, required: true, default: 'UPGRADE' },
  validFrom: { type: Date, required: true, alias: 'valid_from' },
  validUntil: { type: Date, required: true, alias: 'valid_until' },
  isActive: { type: Boolean, default: true, alias: 'is_active' },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'menu_rights',
});

MenuRightSchema.index({ userId: 1, isActive: 1 });
MenuRightSchema.index({ userId: 1, tier: 1, source: 1 });
// Master Plan §2.7 — Downgrade grace: validUntil < now olunca cron temizler
MenuRightSchema.index({ validUntil: 1, isActive: 1 });

export const MenuRight = model<IMenuRight>('MenuRight', MenuRightSchema);
