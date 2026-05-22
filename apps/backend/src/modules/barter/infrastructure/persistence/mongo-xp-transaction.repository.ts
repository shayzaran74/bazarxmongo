// apps/backend/src/modules/barter/infrastructure/persistence/mongo-xp-transaction.repository.ts
// XpTransaction repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { XpTransaction as XpTransactionModel, IXpTransaction } from '@barterborsa/shared-persistence';
import { IXpTransactionRepository } from '../../domain/repositories/xp-transaction.repository.interface';

@Injectable()
export class MongoXpTransactionRepository implements IXpTransactionRepository {
  private readonly model: Model<IXpTransaction>;

  constructor() {
    this.model = XpTransactionModel;
  }

  async updateExpiresAtByUserAndTypes(
    userId: string,
    types: string[],
    expiresAt: Date,
  ): Promise<void> {
    await this.model.updateMany(
      { userId, type: { $in: types }, expiresAt: null },
      { $set: { expiresAt } },
    ).exec();
  }

  async updateExpiresAtByUserAndNotTypes(
    userId: string,
    excludeTypes: string[],
    expiresAt: Date,
  ): Promise<void> {
    await this.model.updateMany(
      { userId, type: { $nin: excludeTypes }, expiresAt: null },
      { $set: { expiresAt } },
    ).exec();
  }

  async findFirstByUserIdAndType(
    userId: string,
    type: string,
    createdBefore: Date,
  ): Promise<{ id: string; userId: string; type: string } | null> {
    const doc = await this.model.findOne({
      userId,
      type,
      createdAt: { $lt: createdBefore },
    }).exec();
    return doc ? { id: doc.id, userId: doc.userId, type: doc.type } : null;
  }

  async create(data: {
    userId: string;
    amount: number;
    type: string;
    description?: string;
    referenceId?: string;
    referenceType?: string;
    expiresAt?: Date;
  }): Promise<void> {
    const id = 'xpt-' + crypto.randomUUID();
    await this.model.create({
      id,
      userId: data.userId,
      amount: data.amount,
      type: data.type,
      description: data.description,
      referenceId: data.referenceId,
      referenceType: data.referenceType,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
    });
  }
}