import { Schema, model, Types } from 'mongoose';

// AuditLog — generated from Prisma schema
// TODO: strict typing — codegen

export interface IAuditLog {
  id: string;
  entityType: string;
  entityId: string;
  actorId?: string;
  actorType: string;
  previousState?: Schema.Types.Mixed;
  newState?: Schema.Types.Mixed;
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
  createdAt: Date;
}

export const AuditLogSchema = new Schema<IAuditLog>({
  id: { type: String, required: true },
  entityType: { type: String, alias: 'entity_type' },
  entityId: { type: String, alias: 'entity_id' },
  actorId: { type: String, alias: 'actor_id' },
  actorType: { type: String, default: 'USER', alias: 'actor_type' },
  previousState: { type: Schema.Types.Mixed, alias: 'previous_state' },
  newState: { type: Schema.Types.Mixed, alias: 'new_state' },
  ipAddress: { type: String, alias: 'ip_address' },
  userAgent: { type: String, alias: 'user_agent' },
  correlationId: { type: String, alias: 'correlation_id' },
  createdAt: { type: Date, alias: 'created_at' },
}, {
  timestamps: true,
  collection: 'audit_logs',
});

// Composite index
AuditLogSchema.index({ entityType: 1, entityId: 1 });

// Composite index
AuditLogSchema.index({ actorId: 1 });

// Composite index
AuditLogSchema.index({ action: 1 });

// Composite index
AuditLogSchema.index({ createdAt: 1 });

// Composite index
AuditLogSchema.index({ correlationId: 1 });