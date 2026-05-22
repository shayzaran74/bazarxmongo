import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// UserProfile — generated from Prisma schema
// TODO: strict typing — codegen

export interface IUserProfile {
  _id?: string;
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  birthday?: Date;
  gender?: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  phone?: string;
}

export const UserProfileSchema = new Schema<IUserProfile>({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String, alias: 'user_id' },
  firstName: { type: String, alias: 'first_name' },
  lastName: { type: String, alias: 'last_name' },
  avatar: { type: String },
  bio: { type: String },
  birthday: { type: Date },
  gender: { type: String },
  city: { type: String },
  district: { type: String },
  neighborhood: { type: String },
  phone: { type: String },
}, {
  timestamps: true,
  collection: 'user_profiles',
});

// Composite index
UserProfileSchema.index({ firstName: 1 });

// Composite index
UserProfileSchema.index({ lastName: 1 });

export const UserProfile = createModelProxy<IUserProfile>('UserProfile', UserProfileSchema);
