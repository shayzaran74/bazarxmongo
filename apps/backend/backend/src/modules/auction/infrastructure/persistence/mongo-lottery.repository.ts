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
  private readonly ticketModel: Model<ILotteryTicket>;

  constructor() {
    const model: Model<LotteryDocument> = LotteryModel;
    super(model, {
      toDomain: LotteryMapper.prototype.toDomain.bind(LotteryMapper.prototype),
      toPersistence: LotteryMapper.prototype.toPersistence.bind(LotteryMapper.prototype),
    });
    this.ticketModel = LotteryTicketModel as unknown as typeof this.ticketModel;
  }

  // session desteği ile ezip geçiyoruz (override)
  async findById(id: string, session?: any): Promise<Lottery | null> {
    const query = this.model.findOne({ id } as Record<string, unknown>);
    if (session) query.session(session);
    const doc = await query.exec();
    return doc ? this.mapper.toDomain(doc) : null;
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

  async createTicket(ticket: { lotteryId: string; userId: string; numbers: string[] }, session?: any): Promise<ILotteryTicket> {
    const { randomUUID } = await import('crypto');
    const id = randomUUID();
    const data = {
      _id: id,
      id: id,
      lotteryId: ticket.lotteryId,
      userId: ticket.userId,
      numbers: ticket.numbers.join(','),
      createdAt: new Date(),
    };
    const docs = await this.ticketModel.create([data], session ? { session } : undefined);
    const doc = docs[0];
    return {
      id: doc.id,
      lotteryId: doc.lotteryId,
      userId: doc.userId,
      numbers: doc.numbers,
      createdAt: doc.createdAt,
    };
  }

  async countTickets(lotteryId: string, userId?: string, session?: any): Promise<number> {
    const filter: Record<string, unknown> = { lotteryId };
    if (userId) filter.userId = userId;
    const query = this.ticketModel.countDocuments(filter);
    if (session) query.session(session);
    return query;
  }

  async findTicketWithNumbers(lotteryId: string, numbers: string[], session?: any): Promise<ILotteryTicket | null> {
    const regexPattern = `(^|,)(${numbers.join('|')})(,|$)`;
    const query = this.ticketModel.findOne({ lotteryId, numbers: { $regex: regexPattern } });
    if (session) query.session(session);
    const doc = await query.exec();
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