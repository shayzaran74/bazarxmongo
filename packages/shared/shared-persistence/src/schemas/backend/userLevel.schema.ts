import { Schema, model, Types } from 'mongoose';

// UserLevel — generated from Prisma schema
// TODO: strict typing — codegen

export interface IUserLevel {
  _id?: string;
  id: string;
  userId: string;
  currentXp: number;
  lifetimeXp: number;
  level: number;
  tierId?: string;
  lastLoginBonusAt?: Date;
  isFirstOrder: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const UserLevelSchema = new Schema<IUserLevel>({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String },
  currentXp: { type: Number, default: 0 },
  lifetimeXp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  tierId: { type: String },
  lastLoginBonusAt: { type: Date },
  isFirstOrder: { type: Boolean, default: true },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'user_levels',
});

UserLevelSchema.index({ userId: 1 }, { unique: true });

export const UserLevel = model<IUserLevel>('UserLevel', UserLevelSchema);
