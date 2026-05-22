import { createModelProxy } from '../../mongodb/model-proxy';
// packages/shared/shared-persistence/src/schemas/backend/surpriseMenu.schema.ts
// BazarX-GO §10 — Sürpriz Menü: restoranın ölü saatlerini değere dönüştürme

import { Schema } from 'mongoose';

export interface ISurpriseMenuTimeBlock {
  start: string;  // "14:00"
  end:   string;  // "17:00"
}

export interface ISurpriseMenu {
  _id?: string;
  id: string;
  vendorId: string;
  listingId: string;      // hangi menü/ilan sürpriz olarak sunuluyor
  isActive: boolean;
  activeHours: ISurpriseMenuTimeBlock[];
  dailyQuota: number;     // günlük maksimum sürpriz QR
  usedToday: number;      // bugün verilen sürpriz QR sayısı (gece 00:01'de sıfırlanır)
  lastResetAt: Date;
  radiusMeters: number;   // bildirim yarıçapı (varsayılan 500m)
  createdAt: Date;
  updatedAt: Date;
}

const TimeBlockSchema = new Schema<ISurpriseMenuTimeBlock>({
  start: { type: String, required: true },
  end:   { type: String, required: true },
}, { _id: false });

export const SurpriseMenuSchema = new Schema<ISurpriseMenu>({
  _id:          { type: String },
  id:           { type: String, required: true },
  vendorId:     { type: String, required: true },
  listingId:    { type: String, required: true },
  isActive:     { type: Boolean, default: false },
  activeHours:  { type: [TimeBlockSchema], default: [] },
  dailyQuota:   { type: Number, default: 10 },
  usedToday:    { type: Number, default: 0 },
  lastResetAt:  { type: Date, default: () => new Date() },
  radiusMeters: { type: Number, default: 500 },
  createdAt:    { type: Date },
  updatedAt:    { type: Date },
}, {
  timestamps: true,
  collection: 'surprise_menus',
});

SurpriseMenuSchema.index({ vendorId: 1 }, { unique: true }); // vendor başına 1 kayıt
SurpriseMenuSchema.index({ isActive: 1, 'activeHours.start': 1 }); // aktif sürprizler

export const SurpriseMenu = createModelProxy<ISurpriseMenu>('SurpriseMenu', SurpriseMenuSchema);
