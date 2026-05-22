import { createModelProxy } from '../../mongodb/model-proxy';
// packages/shared/shared-persistence/src/schemas/backend/helpArticle.schema.ts
import { Schema } from 'mongoose';

export const HelpArticleStatus = ['DRAFT','PUBLISHED','ARCHIVED'] as const;
export type HelpArticleStatusType = typeof HelpArticleStatus[number];

export interface IHelpArticle {
  _id?: string;
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  categoryId?: string;
  language: string;
  order: number;
  upvotes: number;
  downvotes: number;
  viewCount: number;
  platform?: string;
  status: HelpArticleStatusType;
  isActive: boolean;
  isPopular: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const HelpArticleSchema = new Schema<IHelpArticle>({
  _id: { type: String },
  id: { type: String, required: true },
  title: { type: String },
  slug: { type: String },
  content: { type: String },
  excerpt: { type: String },
  categoryId: { type: String },
  language: { type: String, default: 'tr' },
  order: { type: Number, default: 0 },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  platform: { type: String },
  status: { type: String, enum: HelpArticleStatus, default: 'DRAFT' },
  isActive: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'help_articles',
});

HelpArticleSchema.index({ platform: 1, categoryId: 1, status: 1 });
HelpArticleSchema.index({ slug: 1 }, { unique: true });

export const HelpArticle = createModelProxy<IHelpArticle>('HelpArticle', HelpArticleSchema);