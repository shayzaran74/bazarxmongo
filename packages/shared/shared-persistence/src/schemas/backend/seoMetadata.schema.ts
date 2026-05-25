import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// SeoMetadata — generated from Prisma schema
// TODO: strict typing — codegen

export interface ISeoMetadata {
  _id?: string;
  id: string;
  path: string;
  title?: string;
  description?: string;
  ogImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const SeoMetadataSchema = new Schema<ISeoMetadata>({
  _id: { type: String },
  id: { type: String, required: true },
  path: { type: String },
  title: { type: String },
  description: { type: String },
  ogImage: { type: String, alias: 'og_image' },
  createdAt: { type: Date, alias: 'created_at' },
  updatedAt: { type: Date, alias: 'updated_at' },
}, {
  timestamps: true,
  collection: 'seo_metadata',
});

// Unique index — path benzersiz olmalı (URL bazlı SEO)
SeoMetadataSchema.index({ path: 1 }, { unique: true });

export const SeoMetadata = createModelProxy<ISeoMetadata>('SeoMetadata', SeoMetadataSchema);
