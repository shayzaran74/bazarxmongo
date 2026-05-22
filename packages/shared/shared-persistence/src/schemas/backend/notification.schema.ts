import { createModelProxy } from '../../mongodb/model-proxy';
// packages/shared/shared-persistence/src/schemas/backend/notification.schema.ts
import { Schema } from 'mongoose';

export interface INotification {
  _id?: string;
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  metadata?: Schema.Types.Mixed;
  createdAt: Date;
}

export const NotificationSchema = new Schema<INotification>({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String },
  type: { type: String },
  title: { type: String },
  message: { type: String },
  link: { type: String },
  isRead: { type: Boolean, default: false },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date },
}, {
  timestamps: true,
  collection: 'notifications',
});

NotificationSchema.index({ userId: 1 });
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

export const Notification = createModelProxy<INotification>('Notification', NotificationSchema);
