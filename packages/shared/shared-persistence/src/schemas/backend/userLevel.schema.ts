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
  userId: { type: String, alias: 'user_id' },
  currentXp: { type: Number, default: 0, alias: 'current_xp' },
  lifetimeXp: { type: Number, default: 0, alias: 'lifetime_xp' },
  level: { type: Number, default: 1 },
  tierId: { type: String, alias: 'tier_id' },
  lastLoginBonusAt: { type: Date, alias: 'last_login_bonus_at' },
  isFirstOrder: { type: Boolean, default: true, alias: 'is_first_order' },
  createdAt: { type: Date, alias: 'created_at' },
  updatedAt: { type: Date, alias: 'updated_at' },
}, {
  timestamps: true,
  collection: 'user_levels',
});

UserLevelSchema.index({ userId: 1 }, { unique: true });

export const UserLevel = model<IUserLevel>('UserLevel', UserLevelSchema);
