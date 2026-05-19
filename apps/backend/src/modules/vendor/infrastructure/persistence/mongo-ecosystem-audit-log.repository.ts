// apps/backend/src/modules/vendor/infrastructure/persistence/mongo-ecosystem-audit-log.repository.ts
// EcosystemAuditLog repository — Mongoose (ADR-005 Faz 2c)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { EcosystemAuditLog as EcosystemAuditLogModel, IEcosystemAuditLog } from '@barterborsa/shared-persistence/schemas/backend/ecosystemAuditLog.schema';

export interface EcosystemAuditLogDocument extends IEcosystemAuditLog {
  _id?: string;
}

@Injectable()
export class MongoEcosystemAuditLogRepository {
  private readonly model: Model<EcosystemAuditLogDocument>;

  constructor() {
    this.model = EcosystemAuditLogModel as Model<EcosystemAuditLogDocument>;
  }

  async create(data: {
    ecosystemId: string;
    vendorId?: string;
    action: string;
    severity: string;
    details?: Record<string, unknown>;
  }): Promise<EcosystemAuditLogDocument> {
    const id = 'ecoaudit-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    const doc = new this.model({
      _id: id,
      id,
      ecosystemId: data.ecosystemId,
      vendorId: data.vendorId,
      action: data.action,
      severity: data.severity,
      details: data.details,
    });
    await doc.save();
    return doc;
  }

  async findByEcosystemId(ecosystemId: string, limit = 50): Promise<EcosystemAuditLogDocument[]> {
    return this.model.find({ ecosystemId }).sort({ createdAt: -1 }).limit(limit).exec();
  }
}