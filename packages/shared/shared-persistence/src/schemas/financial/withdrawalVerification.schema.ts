import { Schema, model, Types } from 'mongoose';

// WithdrawalVerification — generated from Prisma schema
// TODO: strict typing — codegen

export interface IWithdrawalVerification {
  id: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  isVerified: boolean;
  userId: string;
  verifiedAt?: Date;
  withdrawalId: string;
}

export const WithdrawalVerificationSchema = new Schema<IWithdrawalVerification>({
  id: { type: String, required: true },
  token: { type: String },
  createdAt: { type: Date, alias: 'created_at' },
  expiresAt: { type: Date, alias: 'expires_at' },
  isVerified: { type: Boolean, default: false, alias: 'is_verified' },
  userId: { type: String, alias: 'user_id' },
  verifiedAt: { type: Date, alias: 'verified_at' },
  withdrawalId: { type: String, alias: 'withdrawal_id' },
}, {
  timestamps: true,
  collection: 'withdrawal_verifications',
});

// Composite index
WithdrawalVerificationSchema.index({ userId: 1 });

// Composite index
WithdrawalVerificationSchema.index({ token: 1 });