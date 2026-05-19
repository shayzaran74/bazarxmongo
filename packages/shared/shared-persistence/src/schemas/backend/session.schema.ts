import { Schema, model, Types } from 'mongoose';

// Session — generated from Prisma schema
// TODO: strict typing — codegen

export interface ISession {
  _id?: string;
  id: string;
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  lastActiveAt: Date;
  createdAt: Date;
  tokenHash?: string;
}

export const SessionSchema = new Schema<ISession>({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String, alias: 'user_id' },
  userAgent: { type: String, alias: 'user_agent' },
  ipAddress: { type: String, alias: 'ip_address' },
  lastActiveAt: { type: Date, alias: 'last_active_at' },
  createdAt: { type: Date, alias: 'created_at' },
  tokenHash: { type: String, alias: 'token_hash' },
}, {
  timestamps: true,
  collection: 'sessions',
});

// Composite index
SessionSchema.index({ tokenHash: 1 });

// Composite index
SessionSchema.index({ userId: 1 });

export const Session = model<ISession>('Session', SessionSchema);
