// apps/backend/src/modules/barter/infrastructure/persistence/mongo-swap-session.repository.ts
// SwapSession repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseMongoRepository } from '@barterborsa/shared-persistence/mongodb/base-mongo.repository';
import { SwapSession as SwapSessionModel, ISwapSession } from '@barterborsa/shared-persistence/schemas/backend/swapSession.schema';
import { SwapSessionMapper, SwapSessionDocument } from './mappers/swap-session.mapper';
import { ISwapSessionRepository } from '../../domain/repositories/swap-session.repository.interface';
import { SwapSession } from '../../domain/entities/swap-session.entity';

@Injectable()
export class MongoSwapSessionRepository
  extends BaseMongoRepository<SwapSession, SwapSessionDocument>
  implements ISwapSessionRepository
{
  constructor() {
    const model: Model<SwapSessionDocument> = SwapSessionModel;
    super(model, {
      toDomain: SwapSessionMapper.prototype.toDomain.bind(SwapSessionMapper.prototype),
      toPersistence: SwapSessionMapper.prototype.toPersistence.bind(SwapSessionMapper.prototype),
    });
  }

  async findByTradeOfferId(tradeOfferId: string): Promise<SwapSession | null> {
    const doc = await this.model.findOne({ tradeOfferId }).exec();
    return doc ? this.mapper.toDomain(doc) : null;
  }

  async findByInitiatorId(initiatorId: string): Promise<SwapSession[]> {
    const docs = await this.model.find({ initiatorId }).exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async findByReceiverId(receiverId: string): Promise<SwapSession[]> {
    const docs = await this.model.find({ receiverId }).exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async findActive(): Promise<SwapSession[]> {
    const docs = await this.model.find({ status: { $in: ['PENDING', 'ACTIVE', 'SHIPPING'] } }).exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async findByCompanyWithFilters(companyId: string, skip: number, take: number): Promise<{ items: SwapSession[]; total: number }> {
    const filter = { $or: [{ initiatorId: companyId }, { receiverId: companyId }] };
    const [docs, total] = await Promise.all([
      this.model.find(filter, {}, { skip, limit: take }).sort({ createdAt: -1 }).exec(),
      this.model.countDocuments(filter),
    ]);
    return { items: docs.map(doc => this.mapper.toDomain(doc)), total };
  }

  async findByIdWithRelations(id: string): Promise<any | null> {
    const doc = await this.model.findOne({ id }).exec();
    if (!doc) return null;
    // parts ve tradeOffer ilişkileri mock — gerçek uygulamada ayrı collection'lardan çekilmeli
    return { ...doc.toObject(), parts: [], tradeOffer: null };
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.model.updateOne({ id }, { $set: { status, updatedAt: new Date() } }).exec();
  }

  async findByStatusAndDeadlineBefore(
    status: string,
    deadline: Date,
    limit: number,
  ): Promise<SwapSession[]> {
    const docs = await this.model
      .find({
        status,
        deadlineAt: { $lte: deadline },
      })
      .limit(limit)
      .exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }
}