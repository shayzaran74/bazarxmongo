// apps/backend/src/modules/auction/infrastructure/persistence/mongo-auction-participation.repository.ts
// AuctionParticipation repository — Mongoose implementation (ADR-005 Faz 2a)

import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { AuctionParticipation as ParticipationModel, IAuctionParticipation } from '@barterborsa/shared-persistence';
import { IAuctionParticipationRepository, AuctionParticipation } from '../../domain/repositories/auction-participation.repository.interface';

@Injectable()
export class MongoAuctionParticipationRepository implements IAuctionParticipationRepository {
  private readonly model: Model<IAuctionParticipation>;

  constructor() {
    this.model = ParticipationModel;
  }

  async findByAuctionAndUser(auctionId: string, userId: string): Promise<AuctionParticipation | null> {
    const doc = await this.model.findOne({ auctionId, userId }).exec();
    return doc ? {
      id: doc.id,
      auctionId: doc.auctionId,
      userId: doc.userId,
      status: doc.status,
      holdId: doc.holdId ?? undefined,
      blockedAmount: Number(doc.blockedAmount),
      createdAt: doc.createdAt,
    } : null;
  }

  async create(data: { auctionId: string; userId: string; status: string; holdId?: string; blockedAmount: number }): Promise<AuctionParticipation> {
    const doc = await this.model.create({
      id: randomUUID(),
      ...data,
      createdAt: new Date(),
    });
    return {
      id: doc.id,
      auctionId: doc.auctionId,
      userId: doc.userId,
      status: doc.status,
      holdId: doc.holdId ?? undefined,
      blockedAmount: Number(doc.blockedAmount),
      createdAt: doc.createdAt,
    };
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.model.updateOne({ id }, { $set: { status } }).exec();
  }
}