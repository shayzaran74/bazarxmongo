// apps/backend/src/modules/vendor/domain/repositories/ecosystem-audit-log.repository.interface.ts

export interface EcosystemAuditLogDocument {
  id: string;
  ecosystemId: string;
  vendorId?: string;
  action: string;
  severity: string;
  details?: Record<string, unknown>;
  createdAt: Date;
}

export interface IEcosystemAuditLogRepository {
  create(data: {
    ecosystemId: string;
    vendorId?: string;
    action: string;
    severity: string;
    details?: Record<string, unknown>;
  }): Promise<EcosystemAuditLogDocument>;
  findByEcosystemId(ecosystemId: string, limit?: number): Promise<EcosystemAuditLogDocument[]>;
}
