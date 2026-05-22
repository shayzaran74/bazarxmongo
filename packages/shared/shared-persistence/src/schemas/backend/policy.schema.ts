import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// Policy — generated from Prisma schema
// TODO: strict typing — codegen

export interface IPolicy {
  _id?: string;
  id: string;
  title: string;
  slug: string;
  content: string;
  type: string;
  version: string;
  createdAt: Date;
  isActive: boolean;
  updatedAt: Date;
}

export const PolicySchema = new Schema<IPolicy>({
  _id: { type: String },
  id: { type: String, required: true },
  title: { type: String },
  slug: { type: String },
  content: { type: String },
  type: { type: String },
  version: { type: String, default: '1.0' },
  createdAt: { type: Date, alias: 'created_at' },
  isActive: { type: Boolean, default: true, alias: 'is_active' },
  updatedAt: { type: Date, alias: 'updated_at' },
}, {
  timestamps: true,
  collection: 'policies',
});

export const Policy = createModelProxy<IPolicy>('Policy', PolicySchema);
