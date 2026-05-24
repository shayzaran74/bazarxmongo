// apps/backend/src/modules/barter/infrastructure/persistence/mongo-trade-offer.repository.ts
// TradeOffer repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseMongoRepository } from '@barterborsa/shared-persistence/mongodb/base-mongo.repository';
import { TradeOffer as TradeOfferModel, ITradeOffer } from '@barterborsa/shared-persistence/schemas/backend/tradeOffer.schema';
import { TradeOfferItem, TradeOfferItemSchema } from '@barterborsa/shared-persistence/schemas/backend/tradeOfferItem.schema';
import { TradeOfferMapper, TradeOfferDocument } from './mappers/trade-offer.mapper';
import { ITradeOfferRepository, TradeOfferWithRelations, CreateTradeOfferData } from '../../domain/repositories/trade-offer.repository.interface';
import { TradeOffer } from '../../domain/entities/trade-offer.entity';

@Injectable()
export class MongoTradeOfferRepository
  extends BaseMongoRepository<TradeOffer, TradeOfferDocument>
  implements ITradeOfferRepository
{
  constructor() {
    const model: Model<TradeOfferDocument> = TradeOfferModel;
    super(model, {
      toDomain: TradeOfferMapper.prototype.toDomain.bind(TradeOfferMapper.prototype),
      toPersistence: TradeOfferMapper.prototype.toPersistence.bind(TradeOfferMapper.prototype),
    });
  }

  async listByCompany(companyId: string): Promise<TradeOffer[]> {
    const docs = await this.model.find({
      $or: [{ fromCompanyId: companyId }, { toCompanyId: companyId }],
    }).exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async findPending(): Promise<TradeOffer[]> {
    const docs = await this.model.find({ status: 'PENDING' }).exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async findByCompanyWithFilters(companyId: string, skip: number, take: number, statusFilter?: string[]): Promise<{ items: TradeOffer[]; total: number }> {
    const filter: Record<string, unknown> = {
      $or: [{ fromCompanyId: companyId }, { toCompanyId: companyId }],
    };
    if (statusFilter && statusFilter.length > 0) {
      filter.status = { $in: statusFilter };
    }
    const [docs, total] = await Promise.all([
      this.model.find(filter, {}, { skip, limit: take }).sort({ createdAt: -1 }).exec(),
      this.model.countDocuments(filter),
    ]);
    return { items: docs.map(doc => this.mapper.toDomain(doc)), total };
  }

  async findByIdWithRelations(id: string): Promise<TradeOfferWithRelations | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? (doc.toObject() as unknown as TradeOfferWithRelations) : null;
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.model.updateOne({ id }, { $set: { status } }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ id }).exec();
  }

  async create(data: CreateTradeOfferData): Promise<TradeOffer> {
    const { randomUUID } = await import('crypto');
    const newId = randomUUID();
    const doc = await this.model.create({ _id: newId, id: newId, ...data, createdAt: new Date() });
    return this.mapper.toDomain(doc);
  }

  async findWithFilters(filter: Record<string, unknown>, skip: number, take: number): Promise<{ items: TradeOffer[]; total: number }> {
    const [docs, total] = await Promise.all([
      this.model.find(filter, {}, { skip, limit: take }).sort({ createdAt: -1 }).exec(),
      this.model.countDocuments(filter),
    ]);
    return { items: docs.map(doc => this.mapper.toDomain(doc)), total };
  }
}