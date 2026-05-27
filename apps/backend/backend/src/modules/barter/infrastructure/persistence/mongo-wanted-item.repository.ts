// apps/backend/src/modules/barter/infrastructure/persistence/mongo-wanted-item.repository.ts
// WantedItem repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { IWantedItem } from '@barterborsa/shared-persistence';
import { WantedItem as WantedItemModel } from '@barterborsa/shared-persistence/schemas/backend/wantedItem.schema';
import { WantedItem } from '../../domain/entities/wanted-item.entity';
import { IWantedItemRepository, WantedItemDocument } from '../../domain/repositories/wanted-item.repository.interface';

@Injectable()
export class MongoWantedItemRepository implements IWantedItemRepository {
  private readonly model: Model<IWantedItem>;

  constructor() {
    this.model = WantedItemModel;
  }

  async findById(id: string): Promise<WantedItem | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? (doc.toObject() as unknown as WantedItem) : null;
  }

  async findAll(): Promise<WantedItem[]> {
    const docs = await this.model.find({ isActive: true }).exec();
    return docs.map(doc => doc.toObject() as unknown as WantedItem);
  }

  async save(item: WantedItem): Promise<void> {
    await this.model.create({ id: item.id, ...item.getProps() });
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ id }).exec();
  }

  async findByUserId(userId: string): Promise<WantedItemDocument[]> {
    const docs = await this.model.find({ userId, isActive: true })
      .sort({ createdAt: -1 })
      .exec();
    return docs.map(doc => doc.toObject() as unknown as WantedItemDocument);
  }

  async create(data: {
    id: string;
    categoryId: string;
    keywords: string[];
    description?: string;
    companyId?: string;
    userId: string;
    type: string;
    minPrice?: number;
    maxPrice?: number;
    latitude?: number;
    longitude?: number;
    status: string;
    isActive: boolean;
  }): Promise<void> {
    await this.model.create({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.model.updateOne(
      { id },
      { $set: { isActive: false, status: 'EXPIRED', updatedAt: new Date() } },
    ).exec();
  }
}