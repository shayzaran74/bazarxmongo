// apps/backend/src/modules/content/infrastructure/persistence/mongo-home-banner.repository.ts
// HomeBanner repository — Mongoose implementation (ADR-005 Faz 2c)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { HomeBanner as HomeBannerModel, IHomeBanner } from '@barterborsa/shared-persistence/schemas/backend/homeBanner.schema';
import { HomeBanner } from '../../domain/entities/home-banner.entity';
import { IHomeBannerRepository } from '../../domain/repositories/home-banner.repository.interface';
import { HomeBannerMapper } from './mappers/home-banner.mapper';

@Injectable()
export class MongoHomeBannerRepository implements IHomeBannerRepository {
  private readonly model: Model<IHomeBanner>;

  constructor() {
    this.model = HomeBannerModel;
  }

  private toDomain(doc: Record<string, unknown>): HomeBanner {
    return HomeBannerMapper.toDomain(doc);
  }

  async findById(id: string): Promise<HomeBanner | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? this.toDomain(doc.toObject() as unknown as Record<string, unknown>) : null;
  }

  async findAll(): Promise<HomeBanner[]> {
    const docs = await this.model.find({}).exec();
    return docs.map(doc => this.toDomain(doc.toObject() as unknown as Record<string, unknown>));
  }

  async save(entity: HomeBanner): Promise<void> {
    const data = HomeBannerMapper.toPersistence(entity);
    await this.model.findOneAndUpdate(
      { id: entity.id.toString() },
      data,
      { upsert: true, new: true }
    ).exec();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ id }).exec();
  }

  async findAllActive(platform: string, tag?: string): Promise<HomeBanner[]> {
    const now = new Date();
    const filter: Record<string, any> = {
      platform,
      isActive: true,
      $or: [
        { startDate: null },
        { startDate: { $lte: now } },
      ],
      $and: [
        { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
      ],
    };
    if (tag) filter.tag = tag;

    const docs = await this.model.find(filter).sort({ order: 1 }).exec();
    return docs.map(doc => this.toDomain(doc.toObject() as unknown as Record<string, unknown>));
  }
}