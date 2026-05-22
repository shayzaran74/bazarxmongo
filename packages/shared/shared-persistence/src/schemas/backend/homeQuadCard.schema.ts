import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// HomeQuadCard — generated from Prisma schema
// TODO: strict typing — codegen

export interface IHomeQuadCard {
  _id?: string;
  id: string;
  title: string;
  link?: string;
  order: number;
  isActive: boolean;
  platform?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const HomeQuadCardSchema = new Schema<IHomeQuadCard>({
  _id: { type: String },
  id: { type: String, required: true },
  title: { type: String },
  link: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true, alias: 'is_active' },
  platform: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  createdAt: { type: Date, alias: 'created_at' },
  updatedAt: { type: Date, alias: 'updated_at' },
}, {
  timestamps: true,
  collection: 'home_quad_cards',
});

// Composite index
HomeQuadCardSchema.index({ platform: 1, order: 1 });

export const HomeQuadCard = createModelProxy<IHomeQuadCard>('HomeQuadCard', HomeQuadCardSchema);
