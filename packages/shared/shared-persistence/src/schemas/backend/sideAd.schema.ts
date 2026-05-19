import { Schema, model, Types } from 'mongoose';

// SideAd — generated from Prisma schema
// TODO: strict typing — codegen

export interface ISideAd {
  _id?: string;
  id: string;
  side: string;
  title: string;
  subtitle?: string;
  image?: string;
  emoji?: string;
  link?: string;
  order: number;
  category?: string;
  createdAt: Date;
  isActive: boolean;
  updatedAt: Date;
}

export const SideAdSchema = new Schema<ISideAd>({
  _id: { type: String },
  id: { type: String, required: true },
  side: { type: String },
  title: { type: String },
  subtitle: { type: String },
  image: { type: String },
  emoji: { type: String },
  link: { type: String },
  order: { type: Number, default: 0 },
  category: { type: String },
  createdAt: { type: Date, alias: 'created_at' },
  isActive: { type: Boolean, default: true, alias: 'is_active' },
  updatedAt: { type: Date, alias: 'updated_at' },
}, {
  timestamps: true,
  collection: 'side_ads',
});

// Composite index
SideAdSchema.index({ isActive: 1, order: 1, side: 1 });

export const SideAd = model<ISideAd>('SideAd', SideAdSchema);
