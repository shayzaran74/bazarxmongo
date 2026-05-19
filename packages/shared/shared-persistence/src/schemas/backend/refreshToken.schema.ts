import { Schema, model, Types } from 'mongoose';

// RefreshToken — generated from Prisma schema
// TODO: strict typing — codegen

export interface IRefreshToken {
  _id?: string;
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
}

export const RefreshTokenSchema = new Schema<IRefreshToken>({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String, alias: 'user_id' },
  token: { type: String },
  expiresAt: { type: Date, alias: 'expires_at' },
  revokedAt: { type: Date, alias: 'revoked_at' },
  createdAt: { type: Date, alias: 'created_at' },
}, {
  timestamps: true,
  collection: 'refresh_tokens',
});

// Composite index
RefreshTokenSchema.index({ userId: 1 });

export const RefreshToken = model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
