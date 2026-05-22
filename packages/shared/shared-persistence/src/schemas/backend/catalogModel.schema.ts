import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// CatalogModel — generated from Prisma schema
// TODO: strict typing — codegen

export interface ICatalogModel {
  _id?: string;
  id: string;
  modelCode: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  attributes?: Schema.Types.Mixed;
  categoryId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const CatalogModelSchema = new Schema<ICatalogModel>({
  _id: { type: String },
  id: { type: String, required: true },
  modelCode: { type: String, alias: 'model_code' },
  name: { type: String },
  slug: { type: String },
  brand: { type: String },
  description: { type: String },
  attributes: { type: Schema.Types.Mixed },
  categoryId: { type: String, alias: 'category_id' },
  createdAt: { type: Date, alias: 'created_at' },
  updatedAt: { type: Date, alias: 'updated_at' },
}, {
  timestamps: true,
  collection: 'catalog_models',
});

// Composite index
CatalogModelSchema.index({ modelCode: 1 });

// Composite index
CatalogModelSchema.index({ slug: 1 });

// Composite index
CatalogModelSchema.index({ categoryId: 1 });

export const CatalogModel = createModelProxy<ICatalogModel>('CatalogModel', CatalogModelSchema);
