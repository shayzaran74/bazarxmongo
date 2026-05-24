import { createModelProxy } from '../../mongodb/model-proxy';
// packages/shared/shared-persistence/src/schemas/backend/user.schema.ts
import { Schema } from 'mongoose';

export const UserRole = ['USER','VENDOR','ADMIN','SUPER_ADMIN'] as const;
export type UserRoleType = typeof UserRole[number];

export const UserStatus = ['PENDING','ACTIVE','INACTIVE','SUSPENDED','DELETED'] as const;
export type UserStatusType = typeof UserStatus[number];

export interface IUser {
  _id?: string;
  id: string;
  email: string;
  phoneNumber?: string;
  password?: string;
  transactionPin?: string;
  role: UserRoleType;
  status: UserStatusType;
  isEmailVerified: boolean;
  googleId?: string;
  lockoutUntil?: Date;
  lastLoginAt?: Date;
  lastSeenAt?: Date;
  referredById?: string;
  referralCode?: string;
  deletedAt?: Date;
  // FCM Push Token — Faz 5
  fcmToken?: string;
  fcmTokenUpdatedAt?: Date;
  notificationPreferences?: {
    geofence: boolean;
    menuExpiry: boolean;
    instantOpportunity: boolean;
    silentHoursStart: number;
    silentHoursEnd: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new Schema<IUser>({
  _id: { type: String },
  id: { type: String, required: true },
  email: { type: String },
  phoneNumber: { type: String },
  password: { type: String },
  transactionPin: { type: String },
  role: { type: String, enum: UserRole, default: 'USER' },
  status: { type: String, enum: UserStatus, default: 'PENDING' },
  isEmailVerified: { type: Boolean, default: false },
  googleId: { type: String },
  lockoutUntil: { type: Date },
  lastLoginAt: { type: Date },
  lastSeenAt: { type: Date },
  referredById: { type: String },
  referralCode: { type: String },
  deletedAt: { type: Date },
  // FCM Push Token — Faz 5
  fcmToken: { type: String },
  fcmTokenUpdatedAt: { type: Date },
  notificationPreferences: {
    geofence: { type: Boolean, default: true },
    menuExpiry: { type: Boolean, default: true },
    instantOpportunity: { type: Boolean, default: true },
    silentHoursStart: { type: Number, default: 22 },
    silentHoursEnd: { type: Number, default: 8 },
  },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'users',
});

UserSchema.index({ email: 1 });
UserSchema.index({ phoneNumber: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ referralCode: 1 }, { unique: true, sparse: true });

export const User = createModelProxy<IUser>('User', UserSchema);