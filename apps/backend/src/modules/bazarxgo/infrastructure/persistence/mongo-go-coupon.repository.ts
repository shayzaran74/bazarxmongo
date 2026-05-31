// apps/backend/src/modules/bazarxgo/infrastructure/persistence/mongo-go-coupon.repository.ts

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { GoCoupon, IGoCoupon } from '@barterborsa/shared-persistence';
import { IGoCouponRepository } from '../../domain/repositories/go-coupon.repository.interface';

@Injectable()
export class MongoGoCouponRepository implements IGoCouponRepository {
  async findAll(onlyActive = true): Promise<IGoCoupon[]> {
    const query = onlyActive ? { isActive: true } : {};
    const docs = await GoCoupon.find(query).lean().exec();
    return docs as IGoCoupon[];
  }

  async findByCode(code: string): Promise<IGoCoupon | null> {
    const doc = await GoCoupon.findOne({ code: code.toUpperCase(), isActive: true }).lean().exec();
    return doc as IGoCoupon | null;
  }

  async findById(id: string): Promise<IGoCoupon | null> {
    const doc = await GoCoupon.findOne({ id }).lean().exec();
    return doc as IGoCoupon | null;
  }

  async create(data: Omit<IGoCoupon, '_id' | 'createdAt' | 'updatedAt'>): Promise<IGoCoupon> {
    const id = data.id || randomUUID();
    const doc = await GoCoupon.create({ ...data, _id: id, id });
    return doc.toObject() as IGoCoupon;
  }

  async update(id: string, data: Partial<IGoCoupon>): Promise<IGoCoupon | null> {
    const doc = await GoCoupon.findOneAndUpdate(
      { id },
      { $set: data },
      { new: true },
    ).lean().exec();
    return doc as IGoCoupon | null;
  }

  async incrementUsage(id: string): Promise<void> {
    await GoCoupon.updateOne({ id }, { $inc: { usageCount: 1 }, $set: { updatedAt: new Date() } }).exec();
  }

  async delete(id: string): Promise<void> {
    await GoCoupon.deleteOne({ id }).exec();
  }
}
