import { createModelProxy } from '../../mongodb/model-proxy';
// packages/shared/shared-persistence/src/schemas/backend/announcement.schema.ts
import { Schema } from 'mongoose';

export const AnnouncementType = ['INFO','WARNING','PROMO','MAINTENANCE'] as const;
export type AnnouncementTypeType = typeof AnnouncementType[number];

export interface IAnnouncement {
  _id?: string;
  id: string;
  title: string;
  content: string;
  type: AnnouncementTypeType;
  priority: number;
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  imageUrl?: string;
  linkText?: string;
  linkUrl?: string;
  targetPage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const AnnouncementSchema = new Schema<IAnnouncement>({
  _id: { type: String },
  id: { type: String, required: true },
  title: { type: String },
  content: { type: String },
  type: { type: String, enum: AnnouncementType, default: 'INFO' },
  priority: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date },
  imageUrl: { type: String },
  linkText: { type: String },
  linkUrl: { type: String },
  targetPage: { type: String },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'announcements',
});

AnnouncementSchema.index({ isActive: 1, startDate: 1 });

export const Announcement = createModelProxy<IAnnouncement>('Announcement', AnnouncementSchema);