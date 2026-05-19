import { Schema, model, Types } from 'mongoose';

// VerificationToken — generated from Prisma schema
// TODO: strict typing — codegen

export interface IVerificationToken {
  _id?: string;
  id: string;
  userId: string;
  token: string;
  type: 'EMAIL' | 'PHONE' | 'PASSWORD_RESET';
  expiresAt: Date;
  createdAt: Date;
}

export const VerificationTokenSchema = new Schema<IVerificationToken>({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String, alias: 'user_id' },
  token: { type: String },
  type: { type: String },
  expiresAt: { type: Date, alias: 'expires_at' },
  createdAt: { type: Date, alias: 'created_at' },
}, {
  timestamps: true,
  collection: 'verification_tokens',
});

// Composite index
VerificationTokenSchema.index({ userId: 1 });

export const VerificationToken = model<IVerificationToken>('VerificationToken', VerificationTokenSchema);
