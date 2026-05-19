// packages/shared/shared-persistence/src/mongodb/audit/audit-log.repository.ts
// AuditLog repository — BaseMongoRepository extend eder

import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { BaseMongoRepository } from '../base-mongo.repository';
import { AuditLog, IAuditLog } from '../../schemas/backend/auditLog.schema';
import { AuditLogMapper, AuditLogDomain } from './audit-log.mapper';

@Injectable()
export class AuditLogRepository extends BaseMongoRepository<AuditLogDomain, IAuditLog> {
  constructor() {
    const model: Model<IAuditLog> = AuditLog;
    const mapper = {
      toDomain: AuditLogMapper.toDomain,
      toPersistence: AuditLogMapper.toPersistence,
    };
    super(model, mapper);
  }

  // Append-only — sadece create var, update/delete yok
  async create(entry: AuditLogDomain): Promise<AuditLogDomain> {
    const id = entry.id || new Types.ObjectId().toString();
    const doc = new this.model({
      _id: id,
      id: id,
      actorId: entry.actorId,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      oldValue: entry.oldValue,
      newValue: entry.newValue,
      ipAddress: entry.ipAddress,
      createdAt: entry.createdAt || new Date(),
    });
    await doc.save();
    return this.mapper.toDomain(doc);
  }

  // Query methods — append-only olduğu için findById çok kullanılmaz
  async findByActor(actorId: string, limit = 100): Promise<AuditLogDomain[]> {
    const docs = await this.model
      .find({ actorId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async findByResource(resourceType: string, resourceId: string, limit = 50): Promise<AuditLogDomain[]> {
    const docs = await this.model
      .find({ resourceType, resourceId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async findByAction(action: string, limit = 100): Promise<AuditLogDomain[]> {
    const docs = await this.model
      .find({ action })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }
}