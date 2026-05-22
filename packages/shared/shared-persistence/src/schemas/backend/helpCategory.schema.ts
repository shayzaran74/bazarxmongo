import { createModelProxy } from '../../mongodb/model-proxy';
// packages/shared/shared-persistence/src/schemas/backend/helpCategory.schema.ts
import { Schema } from 'mongoose';

export interface IHelpCategory {
  _id?: string;
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
  language: string;
  parentId?: string;
  platform?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const HelpCategorySchema = new Schema<IHelpCategory>({
  _id: { type: String },
  id: { type: String, required: true },
  name: { type: String },
  slug: { type: String },
  description: { type: String },
  icon: { type: String },
  order: { type: Number, default: 0 },
  language: { type: String, default: 'tr' },
  parentId: { type: String },
  platform: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'help_categories',
});

HelpCategorySchema.index({ platform: 1, order: 1 });

export const HelpCategory = createModelProxy<IHelpCategory>('HelpCategory', HelpCategorySchema);