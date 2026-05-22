// packages/shared/shared-persistence/src/schemas/backend/groupBuy.schema.ts

import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

export interface IGroupBuyTier {
  minQuantity: number;
  price: number;
}

export interface IGroupBuy {
  _id?: string;
  id: string;
  listingId?: string;
  productId?: string;
  title?: string;
  targetQuantity: number;
  currentQuantity: number;
  // Başlangıç fiyatı — kampanya açılışındaki ana fiyat
  originalPrice: Types.Decimal128;
  // Anlık geçerli fiyat (tier'a göre güncellenir)
  price: Types.Decimal128;
  // Kampanya kapandıktan sonra iade dönemi bitiminde belirlenen kesin fiyat
  finalPrice?: Types.Decimal128;
  tiers?: IGroupBuyTier[];
  startDate?: Date;
  endDate: Date;
  // Kampanya bitti + kaç gün iade penceresi bekleneceği (varsayılan 15)
  returnWindowDays: number;
  // İade dönemi bitti, fiyat sabitlendi mi?
  finalizedAt?: Date;
  status: string;
  // ACTIVE → ENDED (süre doldu) → FINALIZED (iade dönemi bitti, kuponlar dağıtıldı)
  createdAt: Date;
}

export const GroupBuySchema = new Schema<IGroupBuy>({
  _id: { type: String, default: () => new Types.ObjectId().toString() },
  id: { type: String, required: true },
  listingId: { type: String },
  productId: { type: String },
  title: { type: String },
  targetQuantity: { type: Number, default: 0 },
  currentQuantity: { type: Number, default: 0 },
  originalPrice: { type: Types.Decimal128, default: 0 },
  price: { type: Types.Decimal128, default: 0 },
  finalPrice: { type: Types.Decimal128 },
  tiers: { type: Schema.Types.Mixed, default: [] },
  startDate: { type: Date },
  endDate: { type: Date, required: true },
  returnWindowDays: { type: Number, default: 15 },
  finalizedAt: { type: Date },
  status: { type: String, default: 'ACTIVE' },
  createdAt: { type: Date },
}, {
  timestamps: true,
  collection: 'group_buys',
});

GroupBuySchema.index({ listingId: 1 });
GroupBuySchema.index({ productId: 1 });
GroupBuySchema.index({ status: 1, endDate: 1 });

export const GroupBuy = createModelProxy<IGroupBuy>('GroupBuy', GroupBuySchema);
