import { createModelProxy } from '../../mongodb/model-proxy';
// packages/shared/shared-persistence/src/schemas/backend/outbox-message.schema.ts
// OutboxMessage — Prisma → Mongoose migration (ADR-005 Faz 2a)
// ADR-005 §8.1: Tek outbox_events collection + module discriminator alanı

import { Schema } from 'mongoose';

export const OutboxStatus = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] as const;
export type OutboxStatusType = typeof OutboxStatus[number];

export interface IOutboxMessage {
  _id?: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  exchange: string;
  routingKey: string;
  payload: Record<string, unknown>;
  status: OutboxStatusType;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  processedAt?: Date;
  error?: string;
  // Module discriminator — hangi servis bu mesajı oluşturdu
  module?: string;
}

export const OutboxMessageSchema = new Schema<IOutboxMessage>({
  _id: { type: String, default: () => { const { randomUUID } = require('crypto'); return randomUUID(); } },
  aggregateId: { type: String, required: true },
  aggregateType: { type: String, required: true },
  eventType: { type: String, required: true },
  exchange: { type: String, default: '' },
  routingKey: { type: String, default: '' },
  payload: { type: Schema.Types.Mixed, required: true },
  status: { type: String, enum: OutboxStatus, default: 'PENDING' },
  retryCount: { type: Number, default: 0 },
  maxRetries: { type: Number, default: 3 },
  createdAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  error: { type: String },
  module: { type: String }, // Module discriminator
}, {
  timestamps: true,
  collection: 'outbox_events',
});

OutboxMessageSchema.index({ status: 1, createdAt: 1 });
OutboxMessageSchema.index({ aggregateId: 1, aggregateType: 1 });
OutboxMessageSchema.index({ module: 1, processedAt: 1 });

export const OutboxMessage = createModelProxy<IOutboxMessage>('OutboxMessage', OutboxMessageSchema);