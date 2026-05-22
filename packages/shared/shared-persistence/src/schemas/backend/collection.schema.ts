import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// Collection — generated from Prisma schema
// TODO: strict typing — codegen

export interface ICollection {
  _id?: string;
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const CollectionSchema = new Schema<ICollection>({
  _id: { type: String },
  id: { type: String, required: true },
  name: { type: String },
  slug: { type: String },
  description: { type: String },
  image: { type: String },
  isPublic: { type: Boolean, default: true, alias: 'is_public' },
  createdAt: { type: Date, alias: 'created_at' },
  updatedAt: { type: Date, alias: 'updated_at' },
}, {
  timestamps: true,
  collection: 'collections',
});

export const Collection = createModelProxy<ICollection>('Collection', CollectionSchema);
