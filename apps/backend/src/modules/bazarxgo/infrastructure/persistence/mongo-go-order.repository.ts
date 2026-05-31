// apps/backend/src/modules/bazarxgo/infrastructure/persistence/mongo-go-order.repository.ts

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { GoOrder, IGoOrder, GoOrderStatusValue, GoSettlementStatusValue, GoPayoutStatusValue } from '@barterborsa/shared-persistence';
import { IGoOrderRepository } from '../../domain/repositories/go-order.repository.interface';

@Injectable()
export class MongoGoOrderRepository implements IGoOrderRepository {
  async findById(id: string): Promise<IGoOrder | null> {
    const doc = await GoOrder.findOne({ id }).lean().exec();
    return doc as IGoOrder | null;
  }

  async findByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ items: IGoOrder[]; total: number }> {
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      GoOrder.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      GoOrder.countDocuments({ userId }).exec(),
    ]);
    return { items: docs as IGoOrder[], total };
  }

  async create(data: Omit<IGoOrder, '_id' | 'createdAt' | 'updatedAt'>): Promise<IGoOrder> {
    const id = data.id || randomUUID();
    const doc = await GoOrder.create({ ...data, _id: id, id });
    return doc.toObject() as IGoOrder;
  }

  async updateStatus(id: string, status: GoOrderStatusValue): Promise<void> {
    await GoOrder.updateOne({ id }, { $set: { status, updatedAt: new Date() } }).exec();
  }

  async updateSettlementStatus(id: string, settlementStatus: GoSettlementStatusValue): Promise<void> {
    await GoOrder.updateOne({ id }, { $set: { settlementStatus, updatedAt: new Date() } }).exec();
  }

  async updatePayoutStatus(id: string, payoutStatus: GoPayoutStatusValue): Promise<void> {
    await GoOrder.updateOne({ id }, { $set: { payoutStatus, updatedAt: new Date() } }).exec();
  }

  async assignHold(id: string, holdId: string): Promise<void> {
    await GoOrder.updateOne({ id }, { $set: { holdId, updatedAt: new Date() } }).exec();
  }
}
