import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema } from 'mongoose';

export const EcosystemAuditSeverity = ['INFO','WARN','HIGH','CRITICAL'] as const;
export type EcosystemAuditSeverityType = typeof EcosystemAuditSeverity[number];

export interface IEcosystemAuditLog {
  _id?: string;
  id: string;
  ecosystemId?: string;
  vendorId?: string;
  action: string;
  severity: EcosystemAuditSeverityType;
  details?: Schema.Types.Mixed;
  createdAt: Date;
}

export const EcosystemAuditLogSchema = new Schema<IEcosystemAuditLog>({
  _id: { type: String },
  id: { type: String, required: true },
  ecosystemId: { type: String },
  vendorId: { type: String },
  action: { type: String },
  severity: { type: String, enum: EcosystemAuditSeverity, default: 'INFO' },
  details: { type: Schema.Types.Mixed },
  createdAt: { type: Date },
}, {
  timestamps: true,
  collection: 'ecosystem_audit_logs',
});

EcosystemAuditLogSchema.index({ ecosystemId: 1 });
EcosystemAuditLogSchema.index({ vendorId: 1 });
EcosystemAuditLogSchema.index({ action: 1 });
EcosystemAuditLogSchema.index({ severity: 1 });

export const EcosystemAuditLog = createModelProxy<IEcosystemAuditLog>('EcosystemAuditLog', EcosystemAuditLogSchema);