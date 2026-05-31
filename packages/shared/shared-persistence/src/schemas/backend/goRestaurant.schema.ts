// packages/shared/shared-persistence/src/schemas/backend/goRestaurant.schema.ts

import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// Gömülü menü item tipi
export interface IGoMenuItemEmbed {
  itemId: string;
  name: string;
  desc: string;
  price: Types.Decimal128;
  oldPrice?: Types.Decimal128;
  emoji: string;
  badge?: string;
  isAvailable: boolean;
}

// Gömülü menü bölümü tipi
export interface IGoMenuSectionEmbed {
  name: string;
  order: number;
  items: IGoMenuItemEmbed[];
}

export interface IGoRestaurant {
  _id?: string;
  id: string;
  slug: string;
  name: string;
  cuisine: string;
  emoji: string;
  categories: string[];
  rating: number;
  ratingCount: string;
  etaMin: number;
  etaMax: number;
  deliveryFee: Types.Decimal128;
  minOrder: Types.Decimal128;
  hero1: string;
  hero2: string;
  tag?: string;
  tagType?: string;
  promo?: string;
  isActive: boolean;
  payoutAccountId?: string; // Restoranın tahsilat (wallet) hesabı; yoksa platform hesabına capture edilir
  sections: IGoMenuSectionEmbed[];
  createdAt: Date;
  updatedAt: Date;
}

const GoMenuItemEmbedSchema = new Schema<IGoMenuItemEmbed>(
  {
    itemId: { type: String, required: true },
    name: { type: String, required: true },
    desc: { type: String, default: '' },
    price: { type: Types.Decimal128, required: true },
    oldPrice: { type: Types.Decimal128 },
    emoji: { type: String, default: '' },
    badge: { type: String },
    isAvailable: { type: Boolean, default: true },
  },
  { _id: false },
);

const GoMenuSectionEmbedSchema = new Schema<IGoMenuSectionEmbed>(
  {
    name: { type: String, required: true },
    order: { type: Number, default: 0 },
    items: { type: [GoMenuItemEmbedSchema], default: [] },
  },
  { _id: false },
);

export const GoRestaurantSchema = new Schema<IGoRestaurant>(
  {
    _id: { type: String },
    id: { type: String, required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    cuisine: { type: String, required: true },
    emoji: { type: String, default: '' },
    categories: { type: [String], default: [] },
    rating: { type: Number, default: 0 },
    ratingCount: { type: String, default: '0' },
    etaMin: { type: Number, default: 20 },
    etaMax: { type: Number, default: 40 },
    deliveryFee: { type: Types.Decimal128, default: 0 },
    minOrder: { type: Types.Decimal128, default: 0 },
    hero1: { type: String, default: '#FF5326' },
    hero2: { type: String, default: '#FF8A3D' },
    tag: { type: String },
    tagType: { type: String },
    promo: { type: String },
    isActive: { type: Boolean, default: true },
    payoutAccountId: { type: String },
    sections: { type: [GoMenuSectionEmbedSchema], default: [] },
  },
  {
    timestamps: true,
    collection: 'go_restaurants',
  },
);

GoRestaurantSchema.index({ slug: 1 }, { unique: true });
GoRestaurantSchema.index({ isActive: 1 });
GoRestaurantSchema.index({ categories: 1, isActive: 1 });
GoRestaurantSchema.index({ name: 'text', cuisine: 'text' });

export const GoRestaurant = createModelProxy<IGoRestaurant>('GoRestaurant', GoRestaurantSchema);
