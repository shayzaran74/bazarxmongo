// apps/backend/src/modules/barterborsa/infrastructure/persistence/mongo-blind-pool.repository.ts
// BlindPool repository — Mongoose (ADR-005 Faz 2c)

import { Injectable } from '@nestjs/common';
import { Model, Types, ClientSession } from 'mongoose';
import { BlindPool as BlindPoolModel, IBlindPool } from '@barterborsa/shared-persistence/schemas/backend/blindPool.schema';

export interface BlindPoolDocument extends IBlindPool {
  _id?: string;
}

@Injectable()
export class MongoBlindPoolRepository {
  private readonly model: Model<BlindPoolDocument>;

  constructor() {
    this.model = BlindPoolModel as Model<BlindPoolDocument>;
  }

  async findById(id: string): Promise<BlindPoolDocument | null> {
    return this.model.findOne({ id }).exec();
  }

  async findByGroupId(groupId: string): Promise<BlindPoolDocument[]> {
    return this.model.find({ groupId, isActive: true }).exec();
  }

  async createWithSession(session: ClientSession, data: {
    groupId: string;
    name: string;
    totalStock: number;
    availableStock: number;
    smartCapPct?: number;
    isActive?: boolean;
  }): Promise<BlindPoolDocument> {
    const id = 'bp-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    const doc = new this.model({
      _id: id,
      id,
      groupId: data.groupId,
      name: data.name,
      totalStock: Types.Decimal128.fromString(String(data.totalStock)),
      availableStock: Types.Decimal128.fromString(String(data.availableStock)),
      smartCapPct: Types.Decimal128.fromString(String(data.smartCapPct ?? 25)),
      isActive: data.isActive ?? true,
    });
    await doc.save({ session });
    return doc;
  }

  async updateStock(id: string, delta: number): Promise<void> {
    await this.model.updateOne(
      { id },
      { $inc: { availableStock: Types.Decimal128.fromString(String(-delta)) } }
    ).exec();
  }
}