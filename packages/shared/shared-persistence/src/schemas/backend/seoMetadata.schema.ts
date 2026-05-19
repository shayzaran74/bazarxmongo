import { Schema, model, Types } from 'mongoose';

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

// Composite index
SeoMetadataSchema.index({ platform: 1, path: 1 });

export const SeoMetadata = model<ISeoMetadata>('SeoMetadata', SeoMetadataSchema);
