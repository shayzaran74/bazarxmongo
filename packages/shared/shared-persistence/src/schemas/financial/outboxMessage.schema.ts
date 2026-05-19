import { Schema, model, Types } from 'mongoose';

// OutboxMessage — generated from Prisma schema
// TODO: strict typing — codegen

export interface IOutboxMessage {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  payload: Schema.Types.Mixed;
  status: string;
  retryCount: number;
  createdAt: Date;
  processedAt?: Date;
}

export const OutboxMessageSchema = new Schema<IOutboxMessage>({
  id: { type: String, required: true },
  aggregateId: { type: String, alias: 'aggregate_id' },
  aggregateType: { type: String, alias: 'aggregate_type' },
  eventType: { type: String, alias: 'event_type' },
  payload: { type: Schema.Types.Mixed },
  status: { type: String, default: 'PENDING' },
  retryCount: { type: Number, default: 0, alias: 'retry_count' },
  createdAt: { type: Date, alias: 'created_at' },
  processedAt: { type: Date, alias: 'processed_at' },
}, {
  timestamps: true,
  collection: 'outbox_messages',
});

// Composite index
OutboxMessageSchema.index({ status: 1, createdAt: 1 });