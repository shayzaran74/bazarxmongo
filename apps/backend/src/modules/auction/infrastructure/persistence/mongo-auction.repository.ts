// apps/backend/src/modules/auction/infrastructure/persistence/mongo-auction.repository.ts
// Auction repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseMongoRepository } from '@barterborsa/shared-persistence/mongodb/base-mongo.repository';
import { Auction as AuctionModel, IAuction, AuctionBid as AuctionBidModel, IAuctionBid, AuctionParticipation as AuctionParticipationModel, IAuctionParticipation } from '@barterborsa/shared-persistence';
import { AuctionMapper, AuctionDocument } from './mappers/auction.mapper';
import { IAuctionRepository, AuctionWinnerData, AuctionRefundResult } from '../../domain/repositories/auction.repository.interface';
import { Auction } from '../../domain/entities/auction.entity';
import { AuctionBid } from '../../domain/entities/auction-bid.entity';
import { Types } from 'mongoose';

@Injectable()
export class MongoAuctionRepository
  extends BaseMongoRepository<Auction, AuctionDocument>
  implements IAuctionRepository
{
  private readonly bidModel: Model<IAuctionBid>;
  private readonly participationModel: Model<IAuctionParticipation>;

  constructor() {
    const model: Model<AuctionDocument> = AuctionModel;
    super(model, {
      toDomain: AuctionMapper.prototype.toDomain.bind(AuctionMapper.prototype),
      toPersistence: AuctionMapper.prototype.toPersistence.bind(AuctionMapper.prototype),
    });
    this.bidModel = AuctionBidModel;
    this.participationModel = AuctionParticipationModel;
  }

  async findByListingId(listingId: string): Promise<Auction | null> {
    const doc = await this.model.findOne({ listingId }).exec();
    return doc ? this.mapper.toDomain(doc) : null;
  }

  async findActive(): Promise<Auction[]> {
    const docs = await this.model.find({ status: 'ACTIVE' }).exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async findEndingSoon(): Promise<Auction[]> {
    const threshold = new Date(Date.now() + 60 * 60 * 1000);
    const docs = await this.model.find({
      status: 'ACTIVE',
      endTime: { $lte: threshold },
    }).exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async createBid(bid: AuctionBid): Promise<void> {
    const data = {
      _id: bid.id,
      id: bid.id,
      auctionId: bid.getProps().auctionId,
      userId: bid.getProps().userId,
      amount: bid.getProps().amount,
      holdId: bid.getProps().holdId,
      createdAt: new Date(),
    };
    await this.bidModel.create(data);
  }

  async findBidsByAuctionId(auctionId: string, limit = 50): Promise<{ id: string; auctionId: string; userId: string; amount: number; holdId?: string; createdAt: Date }[]> {
    const docs = await this.bidModel
      .find({ auctionId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    return docs.map(doc => ({
      id: doc.id,
      auctionId: doc.auctionId,
      userId: doc.userId,
      amount: Number(doc.amount),
      holdId: doc.holdId,
      createdAt: doc.createdAt,
    }));
  }

  async findParticipation(auctionId: string, userId: string): Promise<{ id: string; auctionId: string; userId: string; status: string; holdId?: string; createdAt: Date } | null> {
    const doc = await this.participationModel.findOne({ auctionId, userId }).exec();
    return doc ? { id: doc.id, auctionId: doc.auctionId, userId: doc.userId, status: doc.status, holdId: doc.holdId, createdAt: doc.createdAt } : null;
  }

  async updateAuctionStatus(auctionId: string, status: string, winnerId?: string): Promise<void> {
    await this.model.updateOne({ id: auctionId }, { $set: { status, ...(winnerId ? { winnerId } : {}) } });
  }

  async findWithFilters(filter: Record<string, unknown>, skip: number, take: number): Promise<{ items: Auction[]; total: number }> {
    const [docs, total] = await Promise.all([
      this.model.find(filter, {}, { skip, limit: take }).sort({ createdAt: -1 }).exec(),
      this.model.countDocuments(filter),
    ]);
    return { items: docs.map(doc => this.mapper.toDomain(doc)), total };
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.model.updateOne({ id }, { $set: { status } }).exec();
  }

  async findParticipationById(id: string): Promise<any | null> {
    const doc = await this.participationModel.findOne({ id }).exec();
    return doc ? { id: doc.id, auctionId: doc.auctionId, userId: doc.userId, status: doc.status, holdId: doc.holdId } : null;
  }

  async updateParticipationStatus(id: string, status: string): Promise<void> {
    await this.participationModel.updateOne({ id }, { $set: { status } }).exec();
  }

  async deleteAuction(id: string): Promise<void> {
    await this.model.deleteOne({ id }).exec();
  }

  async findByIdWithRelations(id: string): Promise<any | null> {
    const doc = await this.model.findOne({ id }).exec();
    if (!doc) return null;
    const [bids, participations] = await Promise.all([
      this.bidModel.find({ auctionId: id }).sort({ amount: -1 }).limit(1).exec(),
      this.participationModel.find({ auctionId: id }).exec(),
    ]);
    return { ...doc.toObject(), bids, participations };
  }

  async findWinnersByAuctionId(auctionId: string): Promise<AuctionWinnerData[]> {
    const { AuctionWinner } = await import('@barterborsa/shared-persistence');
    const docs = await AuctionWinner.find({ auctionId }).sort({ position: -1 }).exec();
    return docs.map(doc => ({
      id: doc.id as string,
      auctionId: doc.auctionId,
      userId: doc.userId,
      position: doc.position,
      amount: doc.amount ?? Types.Decimal128.fromString('0'),
      createdAt: doc.createdAt,
    }));
  }

  async createWinner(data: { auctionId: string; userId: string; position: number; amount: number }): Promise<void> {
    const { AuctionWinner } = await import('@barterborsa/shared-persistence');
    await AuctionWinner.findOneAndUpdate(
      { auctionId: data.auctionId, position: data.position },
      { auctionId: data.auctionId, userId: data.userId, position: data.position, amount: data.amount },
      { upsert: true, new: true },
    );
  }

  async updateManyParticipations(auctionId: string, userId: string, status: string): Promise<void> {
    await this.participationModel.updateMany({ auctionId, userId }, { $set: { status } }).exec();
  }

  async refundParticipation(participationId: string): Promise<AuctionRefundResult | null> {
    const doc = await this.participationModel.findOne({ id: participationId }).exec();
    return doc ? { id: doc.id, holdId: doc.holdId, status: doc.status } : null;
  }

  async findAllParticipations(
    filter: { auctionId?: string; status?: string },
    skip: number,
    limit: number,
  ): Promise<{ items: AuctionParticipationData[]; total: number }> {
    const query: Record<string, unknown> = {};
    if (filter.auctionId) query.auctionId = filter.auctionId;
    if (filter.status)    query.status    = filter.status;

    const [docs, total] = await Promise.all([
      this.participationModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean().exec(),
      this.participationModel.countDocuments(query).exec(),
    ]);

    return {
      items: docs.map(d => ({
        id:            d.id,
        auctionId:     d.auctionId,
        userId:        d.userId,
        status:        d.status,
        holdId:        d.holdId,
        depositAmount: d.depositAmount,
        createdAt:     d.createdAt,
      })),
      total,
    };
  }
}