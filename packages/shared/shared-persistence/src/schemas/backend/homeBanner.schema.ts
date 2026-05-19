// packages/shared/shared-persistence/src/schemas/backend/homeBanner.schema.ts
import { Schema, model } from 'mongoose';

export interface IHomeBanner {
  _id?: string;
  id: string;
  title: string;
  description?: string;
  subtitle?: string;
  image: string;
  tag?: string;
  link?: string;
  buttonText?: string;
  order: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  platform?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const HomeBannerSchema = new Schema<IHomeBanner>({
  _id: { type: String },
  id: { type: String, required: true },
  title: { type: String },
  description: { type: String },
  subtitle: { type: String },
  image: { type: String },
  tag: { type: String },
  link: { type: String },
  buttonText: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date },
  platform: { type: String },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'home_banners',
});

HomeBannerSchema.index({ platform: 1, order: 1 });

export const HomeBanner = model<IHomeBanner>('HomeBanner', HomeBannerSchema);