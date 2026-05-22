import { createModelProxy } from '../../mongodb/model-proxy';
// packages/shared/shared-persistence/src/schemas/backend/auditLog.schema.ts
import { Schema } from 'mongoose';

export interface IAuditLog {
  _id?: string;
  id: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  oldValue?: Schema.Types.Mixed;
  newValue?: Schema.Types.Mixed;
  ipAddress?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export const AuditLogSchema = new Schema<IAuditLog>({
  _id: { type: String },
  id: { type: String, required: true },
  actorId: { type: String },
  action: { type: String },
  resourceType: { type: String },
  resourceId: { type: String },
  oldValue: { type: Schema.Types.Mixed },
  newValue: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
  createdAt: { type: Date },
}, {
  timestamps: true,
  collection: 'audit_logs',
});

AuditLogSchema.index({ actorId: 1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = createModelProxy<IAuditLog>('AuditLog', AuditLogSchema);