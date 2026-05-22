import { createModelProxy } from '../../mongodb/model-proxy';
// packages/shared/shared-persistence/src/schemas/backend/userDeviceToken.schema.ts
// FCM push bildirimi için kullanıcı cihaz token'ı

import { Schema } from 'mongoose';

export interface IUserDeviceToken {
  _id?: string;
  id: string;
  userId: string;
  fcmToken: string;
  platform: 'web' | 'android' | 'ios';
  // Konum bilgisi (geofencing için)
  lastLat?: number;
  lastLng?: number;
  lastLocationAt?: Date;
  // Bildirim tercihleri
  notifyMenuExpiry:    boolean;
  notifySurpriseMenu:  boolean;
  notifyTransfer:      boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const UserDeviceTokenSchema = new Schema<IUserDeviceToken>({
  _id:               { type: String },
  id:                { type: String, required: true },
  userId:            { type: String, required: true },
  fcmToken:          { type: String, required: true },
  platform:          { type: String, enum: ['web', 'android', 'ios'], default: 'web' },
  lastLat:           { type: Number },
  lastLng:           { type: Number },
  lastLocationAt:    { type: Date },
  notifyMenuExpiry:  { type: Boolean, default: true },
  notifySurpriseMenu:{ type: Boolean, default: true },
  notifyTransfer:    { type: Boolean, default: true },
  isActive:          { type: Boolean, default: true },
  createdAt:         { type: Date },
  updatedAt:         { type: Date },
}, {
  timestamps: true,
  collection: 'user_device_tokens',
});

UserDeviceTokenSchema.index({ userId: 1 });
UserDeviceTokenSchema.index({ fcmToken: 1 }, { unique: true });
UserDeviceTokenSchema.index({ isActive: 1, lastLat: 1, lastLng: 1 }); // geofence query

export const UserDeviceToken = createModelProxy<IUserDeviceToken>('UserDeviceToken', UserDeviceTokenSchema);
