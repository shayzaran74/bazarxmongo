// apps/backend/src/modules/content/infrastructure/persistence/mongo-home-quad-card.repository.ts
// HomeQuadCard repository — Mongoose implementation (ADR-005 Faz 2c)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { HomeQuadCard as HomeQuadCardModel, IHomeQuadCard } from '@barterborsa/shared-persistence/schemas/backend/homeQuadCard.schema';
import { HomeQuadCardItem as HomeQuadCardItemModel } from '@barterborsa/shared-persistence/schemas/backend/homeQuadCardItem.schema';
import { HomeQuadCard } from '../../domain/entities/home-quad-card.entity';
import { IHomeQuadCardRepository } from '../../domain/repositories/home-quad-card.repository.interface';
import { HomeQuadCardMapper } from './mappers/home-quad-card.mapper';

@Injectable()
export class MongoHomeQuadCardRepository implements IHomeQuadCardRepository {
  private readonly model: Model<IHomeQuadCard>;

  constructor() {
    this.model = HomeQuadCardModel;
  }

  private toDomain(doc: any): HomeQuadCard {
    return HomeQuadCardMapper.toDomain(doc);
  }

  async findById(id: string): Promise<HomeQuadCard | null> {
    const doc = await this.model.findOne({ id }).lean().exec();
    if (!doc) return null;
    const items = await HomeQuadCardItemModel.find({ quadCardId: id }).sort({ order: 1 }).lean().exec();
    (doc as any).items = items;
    return this.toDomain(doc);
  }

  async findAll(): Promise<HomeQuadCard[]> {
    const docs = await this.model.find({}).lean().exec();
    if (docs.length === 0) return [];
    
    const cardIds = docs.map((d: any) => d.id || d._id?.toString());
    const allItems = await HomeQuadCardItemModel.find({
      quadCardId: { $in: cardIds }
    }).sort({ order: 1 }).lean().exec();

    const itemsMap = new Map<string, any[]>();
    for (const item of allItems) {
      const cardId = item.quadCardId;
      if (!itemsMap.has(cardId)) {
        itemsMap.set(cardId, []);
      }
      itemsMap.get(cardId)!.push(item);
    }

    return docs.map((doc: any) => {
      const docId = doc.id || doc._id?.toString();
      doc.items = itemsMap.get(docId) || [];
      return this.toDomain(doc);
    });
  }

  async save(entity: HomeQuadCard): Promise<void> {
    const data = HomeQuadCardMapper.toPersistence(entity);
    await this.model.findOneAndUpdate(
      { id: entity.id.toString() },
      data,
      { upsert: true, new: true }
    ).exec();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ id }).exec();
  }

  async findAllActive(platform: string): Promise<HomeQuadCard[]> {
    const now = new Date();
    const docs = await this.model.find({
      platform,
      isActive: true,
      $or: [
        { startDate: null },
        { startDate: { $lte: now } },
      ],
      $and: [
        { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
      ],
    }).sort({ order: 1 }).lean().exec();

    if (docs.length === 0) return [];

    const cardIds = docs.map((d: any) => d.id || d._id?.toString());
    const allItems = await HomeQuadCardItemModel.find({
      quadCardId: { $in: cardIds }
    }).sort({ order: 1 }).lean().exec();

    const itemsMap = new Map<string, any[]>();
    for (const item of allItems) {
      const cardId = item.quadCardId;
      if (!itemsMap.has(cardId)) {
        itemsMap.set(cardId, []);
      }
      itemsMap.get(cardId)!.push(item);
    }

    return docs.map((doc: any) => {
      const docId = doc.id || doc._id?.toString();
      doc.items = itemsMap.get(docId) || [];
      return this.toDomain(doc);
    });
  }
}