// apps/backend/src/modules/commerce/infrastructure/persistence/mongo-dispute.repository.ts
// Dispute repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Dispute as DisputeModel, IDispute } from '@barterborsa/shared-persistence/schemas/backend/dispute.schema';
import { DisputeMapper, DisputeDocument } from './mappers/dispute.mapper';
import { IDisputeRepository } from '../../domain/repositories/dispute.repository.interface';

@Injectable()
export class MongoDisputeRepository implements IDisputeRepository {
  private readonly model: Model<DisputeDocument>;

  constructor() {
    this.model = DisputeModel;
  }

  private toDomain(doc: DisputeDocument) {
    return DisputeMapper.toDomain(doc);
  }

  async findById(id: string): Promise<any> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByOrderId(orderId: string): Promise<any | null> {
    const doc = await this.model.findOne({ orderId }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async list(filters: { status?: string; vendorId?: string; userId?: string }): Promise<any[]> {
    const filter: Record<string, unknown> = {};
    if (filters.status) filter.status = filters.status;
    if (filters.vendorId) filter.vendorId = filters.vendorId;
    if (filters.userId) filter.userId = filters.userId;

    const docs = await this.model.find(filter).exec();
    return docs.map(doc => this.toDomain(doc));
  }

  async save(dispute: Partial<any>): Promise<any> {
    const doc = DisputeMapper.toPersistence(dispute);
    await this.model.findOneAndUpdate(
      { id: dispute.id },
      doc,
      { upsert: true, new: true }
    ).exec();
    return { ...dispute, id: dispute.id };
  }
}