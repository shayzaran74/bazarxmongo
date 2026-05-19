// apps/backend/src/modules/auction/infrastructure/persistence/mongo-auction-bid.repository.ts
// AuctionBid repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { AuctionBid as AuctionBidModel, IAuctionBid } from '@barterborsa/shared-persistence';
import { IAuctionBidRepository, AuctionBid } from '../../domain/repositories/auction-bid.repository.interface';

@Injectable()
export class MongoAuctionBidRepository implements IAuctionBidRepository {
  private readonly model: Model<IAuctionBid>;

  constructor() {
    this.model = AuctionBidModel;
  }

  async findByAuctionId(auctionId: string, limit = 50): Promise<AuctionBid[]> {
    const docs = await this.model
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

  async create(data: { auctionId: string; userId: string; amount: number; holdId?: string }): Promise<AuctionBid> {
    const doc = await this.model.create({
      id: 'bid-' + Date.now() + '-' + Math.random().toString(36).substring(7),
      ...data,
      createdAt: new Date(),
    });
    return {
      id: doc.id,
      auctionId: doc.auctionId,
      userId: doc.userId,
      amount: Number(doc.amount),
      holdId: doc.holdId,
      createdAt: doc.createdAt,
    };
  }
}