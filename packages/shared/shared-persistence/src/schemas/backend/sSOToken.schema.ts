import { Schema, model, Types } from 'mongoose';

// SSOToken — generated from Prisma schema
// TODO: strict typing — codegen

export interface ISSOToken {
  _id?: string;
  id: string;
  userId: string;
  provider: string;
  providerId: string;
  accessToken?: string;
  refreshToken?: string;
  createdAt: Date;
}

export const SSOTokenSchema = new Schema<ISSOToken>({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String, alias: 'user_id' },
  provider: { type: String },
  providerId: { type: String, alias: 'provider_id' },
  accessToken: { type: String, alias: 'access_token' },
  refreshToken: { type: String, alias: 'refresh_token' },
  createdAt: { type: Date, alias: 'created_at' },
}, {
  timestamps: true,
  collection: 'sso_tokens',
});

// Composite index
SSOTokenSchema.index({ userId: 1 });

// Unique constraint
SSOTokenSchema.index({ provider: 1, providerId: 1 }, { unique: true });

export const SSOToken = model<ISSOToken>('SSOToken', SSOTokenSchema);
