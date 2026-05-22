import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema } from 'mongoose';

export const CategoryType = ['GENERAL', 'RESTAURANT', 'ECOMMERCE'] as const;
export type CategoryTypeType = typeof CategoryType[number];

export interface ICategory {
  _id?: string;
  id: string;
  name: string;
  slug: string;
  icon?: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  order: number;
  isActive: boolean;
  badgeColor?: string;
  badgeText?: string;
  image?: string;
  type: CategoryTypeType;
  attributeTemplate?: Record<string, unknown>;
  colorFrom?: string;
  colorTo?: string;
  hoverColor?: string;
  shadowColor?: string;
  isFeatured: boolean;
  megaMenuColor?: string;
  megaMenuIcon?: string;
  megaMenuOrder?: number;
  blurhash?: string;
}

export const CategorySchema = new Schema<ICategory>({
  _id: { type: String },
  id: { type: String, required: true },
  name: { type: String },
  slug: { type: String },
  icon: { type: String },
  parentId: { type: String, alias: 'parent_id' },
  createdAt: { type: Date, alias: 'created_at' },
  updatedAt: { type: Date, alias: 'updated_at' },
  description: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  badgeColor: { type: String, default: '#ef4444' },
  badgeText: { type: String },
  image: { type: String },
  type: { type: String, enum: CategoryType, default: 'GENERAL' },
  attributeTemplate: { type: Object },
  colorFrom: { type: String },
  colorTo: { type: String },
  hoverColor: { type: String },
  shadowColor: { type: String },
  isFeatured: { type: Boolean, default: false },
  megaMenuColor: { type: String },
  megaMenuIcon: { type: String },
  megaMenuOrder: { type: Number },
  blurhash: { type: String },
}, {
  timestamps: true,
  collection: 'categories',
});

CategorySchema.index({ order: 1 });
CategorySchema.index({ parentId: 1 });
CategorySchema.index({ slug: 1 });
CategorySchema.index({ isActive: 1 });

export const Category = createModelProxy<ICategory>('Category', CategorySchema);