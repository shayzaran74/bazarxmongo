// apps/backend/src/modules/auction/infrastructure/persistence/mongo-lottery.repository.ts
// Lottery repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseMongoRepository } from '@barterborsa/shared-persistence/mongodb/base-mongo.repository';
import { Lottery as LotteryModel, ILottery, LotteryTicket as LotteryTicketModel } from '@barterborsa/shared-persistence';
import { LotteryMapper, LotteryDocument } from './mappers/lottery.mapper';
import { ILotteryRepository, ILotteryTicket } from '../../domain/repositories/lottery.repository.interface';
import { Lottery } from '../../domain/entities/lottery.entity';

@Injectable()
export class MongoLotteryRepository
  extends BaseMongoRepository<Lottery, LotteryDocument>
  implements ILotteryRepository
{
  private readonly ticketModel: Model<any>;

  constructor() {
    const model: Model<LotteryDocument> = LotteryModel;
    super(model, {
      toDomain: LotteryMapper.prototype.toDomain.bind(LotteryMapper.prototype),
      toPersistence: LotteryMapper.prototype.toPersistence.bind(LotteryMapper.prototype),
    });
    this.ticketModel = LotteryTicketModel;
  }

  async findByOwnerId(ownerId: string): Promise<Lottery[]> {
    const docs = await this.model.find({ ownerId }).exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async findActive(): Promise<Lottery[]> {
    const docs = await this.model.find({ status: 'ACTIVE' }).exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async findTickets(lotteryId: string): Promise<ILotteryTicket[]> {
    const docs = await this.ticketModel.find({ lotteryId }).exec();
    return docs.map(doc => ({
      id: doc.id,
      lotteryId: doc.lotteryId,
      userId: doc.userId,
      numbers: doc.numbers,
      createdAt: doc.createdAt,
    }));
  }

  async findWithFilters(filter: Record<string, unknown>, skip: number, take: number): Promise<{ items: Lottery[]; total: number }> {
    const [docs, total] = await Promise.all([
      this.model.find(filter, {}, { skip, limit: take }).sort({ createdAt: -1 }).exec(),
      this.model.countDocuments(filter),
    ]);
    return { items: docs.map(doc => this.mapper.toDomain(doc)), total };
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.model.updateOne({ id }, { $set: { status } }).exec();
  }

  async createTicket(ticket: { lotteryId: string; userId: string; numbers: string[] }): Promise<ILotteryTicket> {
    const doc = await this.ticketModel.create(ticket);
    return {
      id: doc.id,
      lotteryId: doc.lotteryId,
      userId: doc.userId,
      numbers: doc.numbers,
      createdAt: doc.createdAt,
    };
  }

  async countTickets(lotteryId: string, userId?: string): Promise<number> {
    const filter: Record<string, unknown> = { lotteryId };
    if (userId) filter.userId = userId;
    return this.ticketModel.countDocuments(filter);
  }

  async findTicketWithNumbers(lotteryId: string, numbers: string[]): Promise<ILotteryTicket | null> {
    const doc = await this.ticketModel.findOne({ lotteryId, numbers: { $in: numbers } }).exec();
    return doc ? { id: doc.id, lotteryId: doc.lotteryId, userId: doc.userId, numbers: doc.numbers, createdAt: doc.createdAt } : null;
  }

  async findExpiredActive(): Promise<{ id: string; title: string }[]> {
    const now = new Date();
    const docs = await this.model.find({ status: 'ACTIVE', endTime: { $lte: now } }, { id: 1, title: 1 }).exec();
    return docs.map(doc => ({ id: doc.id, title: doc.title }));
  }

  async findTicketsByUserId(userId: string): Promise<ILotteryTicket[]> {
    const docs = await this.ticketModel.find({ userId }).exec();
    return docs.map(doc => ({
      id: doc.id,
      lotteryId: doc.lotteryId,
      userId: doc.userId,
      numbers: doc.numbers,
      createdAt: doc.createdAt,
    }));
  }
}