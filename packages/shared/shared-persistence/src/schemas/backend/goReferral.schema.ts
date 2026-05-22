import { createModelProxy } from '../../mongodb/model-proxy';
// packages/shared/shared-persistence/src/schemas/backend/goReferral.schema.ts
// BazarX-GO §7 — Referans sistemi (tek katmanlı, zincirleme yok)

import { Schema, Types } from 'mongoose';

export const GoReferralStatus = ['PENDING', 'ACTIVATED', 'BONUS_GRANTED', 'BONUS_EXPIRED'] as const;
export type GoReferralStatusType = typeof GoReferralStatus[number];

export interface IGoReferral {
  _id?: string;
  id: string;
  referrerId:     string;   // referans veren userId
  refereeId:      string;   // referans alınan userId
  referralCode:   string;   // referrerId'den üretilen benzersiz kod
  // Referans alanın aldığı tier ve ödediği aidat (bonus hesabı için)
  refereeTier:    string;
  refereePaidAmount: Types.Decimal128;
  // XP
  xpGrantedToReferrer: number;
  xpGrantedToReferee:  number;
  // Bonus (3. referansta tetiklenir)
  isBonusTrigger:  boolean;   // Bu kayıt 3. referans mı?
  bonusMenuCategory?: number; // Verilen bonus menünün kategorisi
  bonusPurchaseId?:   string; // Oluşturulan MenuPurchase ID
  bonusExpiresAt?:    Date;   // 45 gün içinde kullanılmalı
  status: GoReferralStatusType;
  createdAt: Date;
  updatedAt: Date;
}

export const GoReferralSchema = new Schema<IGoReferral>({
  _id:                 { type: String },
  id:                  { type: String, required: true },
  referrerId:          { type: String, required: true },
  refereeId:           { type: String, required: true },
  referralCode:        { type: String, required: true },
  refereeTier:         { type: String },
  refereePaidAmount:   { type: Types.Decimal128 },
  xpGrantedToReferrer: { type: Number, default: 0 },
  xpGrantedToReferee:  { type: Number, default: 0 },
  isBonusTrigger:      { type: Boolean, default: false },
  bonusMenuCategory:   { type: Number },
  bonusPurchaseId:     { type: String },
  bonusExpiresAt:      { type: Date },
  status:              { type: String, enum: GoReferralStatus, default: 'PENDING' },
  createdAt:           { type: Date },
  updatedAt:           { type: Date },
}, {
  timestamps: true,
  collection: 'go_referrals',
});

GoReferralSchema.index({ referrerId: 1, createdAt: -1 });
GoReferralSchema.index({ refereeId: 1 }, { unique: true }); // 1 kişi 1 kez referans alabilir
GoReferralSchema.index({ referralCode: 1 });
GoReferralSchema.index({ bonusExpiresAt: 1, status: 1 }); // expiry cron

export const GoReferral = createModelProxy<IGoReferral>('GoReferral', GoReferralSchema);
