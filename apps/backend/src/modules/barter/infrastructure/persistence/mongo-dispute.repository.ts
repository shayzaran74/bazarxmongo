// apps/backend/src/modules/barter/infrastructure/persistence/mongo-dispute.repository.ts
// BarterDisputeLog repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BarterDisputeLog as BarterDisputeLogModel, IBarterDisputeLog } from '@barterborsa/shared-persistence';
import { IDisputeRepository } from '../../domain/repositories/dispute.repository.interface';

type DisputeDoc = IBarterDisputeLog;

@Injectable()
export class MongoDisputeRepository implements IDisputeRepository {
  private readonly model: Model<IBarterDisputeLog>;

  constructor() {
    this.model = BarterDisputeLogModel;
  }

  async create(data: {
    swapSessionId: string;
    tradeOfferId: string;
    openedById: string;
    respondentId: string;
    reason: string;
    status: string;
    resolutionDeadlineAt: Date;
    tradeValueInKurus?: number;
  }): Promise<void> {
    const { randomUUID } = await import('crypto');
    const id = 'dispute-' + randomUUID();
    await this.model.create({
      id,
      ...data,
      tradeValueInKurus: data.tradeValueInKurus ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.model.updateOne({ id }, { $set: { status, updatedAt: new Date() } }).exec();
  }

  async updateResolved(swapSessionId: string, data: {
    resolvedAt: Date;
    resolvedById: string;
    resolutionNote?: string;
  }): Promise<void> {
    await this.model.updateOne(
      { swapSessionId },
      { $set: { status: 'RESOLVED', resolvedAt: data.resolvedAt, resolvedById: data.resolvedById, resolutionNote: data.resolutionNote, updatedAt: new Date() } },
    ).exec();
  }

  async findOpenByUserId(userId: string): Promise<{ id: string } | null> {
    const doc = await this.model.findOne({
      $or: [{ openedById: userId }, { respondentId: userId }],
      status: { $in: ['OPEN', 'AUTO_REVIEW', 'MANUAL_REVIEW', 'ARBITRATION'] },
    }).exec();
    return doc ? { id: doc.id } : null;
  }

  async findByStatus(status: string, limit = 50): Promise<DisputeDoc[]> {
    const docs = await this.model.find({ status }).limit(limit).exec();
    return docs.map(doc => doc.toObject() as DisputeDoc);
  }

  async findById(id: string): Promise<DisputeDoc | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? (doc.toObject() as DisputeDoc) : null;
  }

  async findByStatusAndCreatedBefore(status: string, cutoff: Date, limit = 50): Promise<DisputeDoc[]> {
    const docs = await this.model.find({ status, createdAt: { $lte: cutoff } }).limit(limit).exec();
    return docs.map(doc => doc.toObject() as DisputeDoc);
  }

  async findByStatusAndUpdatedBefore(status: string, cutoff: Date, limit = 50): Promise<DisputeDoc[]> {
    const docs = await this.model.find({ status, updatedAt: { $lte: cutoff } }).limit(limit).exec();
    return docs.map(doc => doc.toObject() as DisputeDoc);
  }

  async updateStatusAndDeadline(id: string, status: string, resolutionDeadlineAt: Date): Promise<void> {
    await this.model.updateOne(
      { id },
      { $set: { status, resolutionDeadlineAt, updatedAt: new Date() } },
    ).exec();
  }

  async updateResolutionDetails(id: string, data: {
    status: string;
    resolution?: string;
    resolutionNote?: string;
    resolvedAt: Date;
    arbitratorType?: string;
    resolutionDeadlineAt?: Date;
  }): Promise<void> {
    const updateData: Record<string, unknown> = {
      status: data.status,
      updatedAt: new Date(),
    };
    if (data.resolution !== undefined) updateData.resolution = data.resolution;
    if (data.resolutionNote !== undefined) updateData.resolutionNote = data.resolutionNote;
    if (data.resolvedAt !== undefined) updateData.resolvedAt = data.resolvedAt;
    if (data.arbitratorType !== undefined) updateData.arbitratorType = data.arbitratorType;
    if (data.resolutionDeadlineAt !== undefined) updateData.resolutionDeadlineAt = data.resolutionDeadlineAt;

    await this.model.updateOne({ id }, { $set: updateData }).exec();
  }
}