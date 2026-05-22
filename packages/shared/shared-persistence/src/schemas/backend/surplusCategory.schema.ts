import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// SurplusCategory — generated from Prisma schema
// TODO: strict typing — codegen

export interface ISurplusCategory {
  _id?: string;
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const SurplusCategorySchema = new Schema<ISurplusCategory>({
  _id: { type: String },
  id: { type: String, required: true },
  name: { type: String },
  slug: { type: String },
  icon: { type: String },
  parentId: { type: String, alias: 'parent_id' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true, alias: 'is_active' },
  createdAt: { type: Date, alias: 'created_at' },
  updatedAt: { type: Date, alias: 'updated_at' },
}, {
  timestamps: true,
  collection: 'surplus_categories',
});

// Composite index
SurplusCategorySchema.index({ parentId: 1 });

// Composite index
SurplusCategorySchema.index({ slug: 1 });

export const SurplusCategory = createModelProxy<ISurplusCategory>('SurplusCategory', SurplusCategorySchema);
