import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// OutboxMessage — generated from Prisma schema
// TODO: strict typing — codegen

export interface IOutboxMessage {
  _id?: string;
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  exchange: string;
  routingKey: string;
  payload: Schema.Types.Mixed;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  processedAt?: Date;
  error?: string;
}

export const OutboxMessageSchema = new Schema<IOutboxMessage>({
  _id: { type: String },
  id: { type: String, required: true },
  aggregateId: { type: String, alias: 'aggregate_id' },
  aggregateType: { type: String, alias: 'aggregate_type' },
  eventType: { type: String, alias: 'event_type' },
  exchange: { type: String, default: '' },
  routingKey: { type: String, default: '' },
  payload: { type: Schema.Types.Mixed },
  retryCount: { type: Number, default: 0, alias: 'retry_count' },
  maxRetries: { type: Number, default: 3, alias: 'max_retries' },
  createdAt: { type: Date, alias: 'created_at' },
  processedAt: { type: Date, alias: 'processed_at' },
  error: { type: String },
}, {
  timestamps: true,
  collection: 'outbox_messages',
});

// Composite index
OutboxMessageSchema.index({ status: 1, createdAt: 1 });

export const OutboxMessage = createModelProxy<IOutboxMessage>('OutboxMessage', OutboxMessageSchema);
