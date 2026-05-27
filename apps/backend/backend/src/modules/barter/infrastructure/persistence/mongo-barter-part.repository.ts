// apps/backend/src/modules/barter/infrastructure/persistence/mongo-barter-part.repository.ts
// BarterPart repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BarterPart as BarterPartModel, IBarterPart } from '@barterborsa/shared-persistence';
import { IBarterPartRepository, BarterPart } from '../../domain/repositories/barter-part.repository.interface';

@Injectable()
export class MongoBarterPartRepository implements IBarterPartRepository {
  private readonly model: Model<IBarterPart>;

  constructor() {
    this.model = BarterPartModel;
  }

  private toDomain(doc: IBarterPart): BarterPart {
    return {
      id: doc.id,
      swapSessionId: doc.swapSessionId ?? '',
      partNumber: doc.partNumber ?? 0,
      senderId: doc.senderId ?? '',
      recipientId: doc.recipientId ?? '',
      status: doc.status ?? 'PENDING',
      trackingCode: doc.trackingCode,
      carrier: doc.carrier,
      shippedAt: doc.shippedAt,
      deliveredAt: doc.deliveredAt,
      confirmedAt: doc.confirmedAt,
      disputedAt: doc.disputedAt,
      disputeWindowEndsAt: doc.disputeWindowEndsAt,
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    };
  }

  async findById(id: string): Promise<BarterPart | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findBySwapSessionAndSender(swapSessionId: string, senderId: string): Promise<BarterPart | null> {
    const doc = await this.model.findOne({ swapSessionId, senderId }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findBySwapSessionAndRecipient(swapSessionId: string, recipientId: string): Promise<BarterPart | null> {
    const doc = await this.model.findOne({ swapSessionId, recipientId }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findAllBySwapSession(swapSessionId: string): Promise<BarterPart[]> {
    const docs = await this.model.find({ swapSessionId }).exec();
    return docs.map(doc => this.toDomain(doc));
  }

  async create(data: {
    id: string;
    swapSessionId: string;
    partNumber: number;
    senderId: string;
    recipientId: string;
    status?: string;
  }): Promise<BarterPart> {
    const doc = await this.model.create({
      id: data.id,
      swapSessionId: data.swapSessionId,
      partNumber: data.partNumber,
      senderId: data.senderId,
      recipientId: data.recipientId,
      status: data.status ?? 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return this.toDomain(doc);
  }

  async updateShipping(id: string, data: {
    trackingCode: string;
    carrier: string;
    status: string;
    shippedAt: Date;
  }): Promise<void> {
    await this.model.updateOne(
      { id },
      { $set: { trackingCode: data.trackingCode, carrier: data.carrier, status: data.status, shippedAt: data.shippedAt, updatedAt: new Date() } },
    ).exec();
  }

  async updateConfirmation(id: string, data: {
    status: string;
    deliveredAt: Date;
    confirmedAt: Date;
    disputeWindowEndsAt: Date;
  }): Promise<void> {
    await this.model.updateOne(
      { id },
      { $set: { status: data.status, deliveredAt: data.deliveredAt, confirmedAt: data.confirmedAt, disputeWindowEndsAt: data.disputeWindowEndsAt, updatedAt: new Date() } },
    ).exec();
  }
}