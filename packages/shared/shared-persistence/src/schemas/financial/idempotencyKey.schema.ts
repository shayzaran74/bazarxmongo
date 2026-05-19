import { Schema, model, Types } from 'mongoose';

// IdempotencyKey — generated from Prisma schema
// TODO: strict typing — codegen

export interface IIdempotencyKey {
  key: string;
  userId?: string;
  result?: Schema.Types.Mixed;
  status: string;
  expiresAt: Date;
  createdAt: Date;
}

export const IdempotencyKeySchema = new Schema<IIdempotencyKey>({
  key: { type: String },
  userId: { type: String, alias: 'user_id' },
  result: { type: Schema.Types.Mixed },
  status: { type: String, default: 'COMPLETED' },
  expiresAt: { type: Date, alias: 'expires_at' },
  createdAt: { type: Date, alias: 'created_at' },
}, {
  timestamps: true,
  collection: 'idempotency_keys',
});

// Composite index
IdempotencyKeySchema.index({ expiresAt: 1 });