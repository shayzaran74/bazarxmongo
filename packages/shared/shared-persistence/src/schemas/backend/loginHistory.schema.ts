import { Schema, model, Types } from 'mongoose';

// LoginHistory — generated from Prisma schema
// TODO: strict typing — codegen

export interface ILoginHistory {
  _id?: string;
  id: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  status: string;
  reason?: string;
  createdAt: Date;
}

export const LoginHistorySchema = new Schema<ILoginHistory>({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String, alias: 'user_id' },
  ipAddress: { type: String, alias: 'ip_address' },
  userAgent: { type: String, alias: 'user_agent' },
  status: { type: String },
  reason: { type: String },
  createdAt: { type: Date, alias: 'created_at' },
}, {
  timestamps: true,
  collection: 'login_history',
});

// Composite index
LoginHistorySchema.index({ userId: 1 });

export const LoginHistory = model<ILoginHistory>('LoginHistory', LoginHistorySchema);
