// apps/backend/src/modules/barter/infrastructure/persistence/mongo-user-level.repository.ts
// UserLevel repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { IUserLevel } from '@barterborsa/shared-persistence';

import { UserLevel as UserLevelModel } from '@barterborsa/shared-persistence/schemas/backend/userLevel.schema';
import { IUserLevelRepository } from '../../domain/repositories/user-level.repository.interface';

@Injectable()
export class MongoUserLevelRepository implements IUserLevelRepository {
  private readonly model: Model<IUserLevel>;

  constructor() {
    this.model = UserLevelModel;
  }

  async resetXp(userId: string): Promise<void> {
    await this.model.updateMany(
      { userId },
      { $set: { currentXp: 0, updatedAt: new Date() } },
    ).exec();
  }

  async findByUserId(userId: string): Promise<{ userId: string; currentXp: number } | null> {
    const doc = await this.model.findOne({ userId }).exec();
    return doc ? { userId: doc.userId, currentXp: doc.currentXp ?? 0 } : null;
  }

  async decrementXp(userId: string, amount: number): Promise<void> {
    await this.model.updateOne(
      { userId },
      { $inc: { currentXp: -amount }, $set: { updatedAt: new Date() } },
    ).exec();
  }
}