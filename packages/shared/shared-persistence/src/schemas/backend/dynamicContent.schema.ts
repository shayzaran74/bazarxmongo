import { createModelProxy } from '../../mongodb/model-proxy';
// packages/shared/shared-persistence/src/schemas/backend/dynamicContent.schema.ts
import { Schema } from 'mongoose';

export const ContentType = ['TEXT','HTML','MARKDOWN','JSON'] as const;
export type ContentTypeType = typeof ContentType[number];

export interface IDynamicContent {
  _id?: string;
  id: string;
  key: string;
  title: string;
  content: string;
  contentType: ContentTypeType;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const DynamicContentSchema = new Schema<IDynamicContent>({
  _id: { type: String },
  id: { type: String, required: true },
  key: { type: String },
  title: { type: String },
  content: { type: String },
  contentType: { type: String, enum: ContentType, default: 'TEXT' },
  category: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'dynamic_contents',
});

DynamicContentSchema.index({ key: 1 }, { unique: true });
DynamicContentSchema.index({ category: 1, isActive: 1 });

export const DynamicContent = createModelProxy<IDynamicContent>('DynamicContent', DynamicContentSchema);