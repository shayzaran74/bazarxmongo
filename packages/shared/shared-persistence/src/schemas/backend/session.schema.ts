import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema } from 'mongoose';

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

// Compound index for query performance on { userId, tokenHash }
SessionSchema.index({ userId: 1, tokenHash: 1 });

// TTL index to automatically remove sessions older than 30 days
SessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export const Session = createModelProxy<ISession>('Session', SessionSchema);
