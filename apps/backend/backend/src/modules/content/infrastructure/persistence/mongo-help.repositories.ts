// apps/backend/src/modules/content/infrastructure/persistence/prisma-help.repositories.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IHelpCategoryRepository } from '../../domain/repositories/help-category.repository.interface';
import { IHelpArticleRepository } from '../../domain/repositories/help-article.repository.interface';
import { HelpCategory } from '../../domain/entities/help-category.entity';
import { HelpArticle } from '../../domain/entities/help-article.entity';
import { HelpCategoryMapper, HelpArticleMapper } from './mappers/help.mappers';
import { IHelpCategory, IHelpArticle } from '@barterborsa/shared-persistence';

@Injectable()
export class PrismaHelpCategoryRepository implements IHelpCategoryRepository {
  constructor(
    @InjectModel('HelpCategory') private readonly model: Model<IHelpCategory>,
  ) {}

  async findById(id: string): Promise<HelpCategory | null> {
    const raw = await this.model.findOne({ id }).lean();
    return raw ? HelpCategoryMapper.toDomain(raw) : null;
  }

  async findBySlug(slug: string): Promise<HelpCategory | null> {
    const raw = await this.model.findOne({ slug }).lean();
    return raw ? HelpCategoryMapper.toDomain(raw) : null;
  }

  async findAllRoots(platform: string, language: string): Promise<HelpCategory[]> {
    const raws = await this.model
      .find({ platform, language, parentId: null, isActive: true })
      .sort({ order: 1 })
      .lean();
    return raws.map(HelpCategoryMapper.toDomain);
  }

  async findChildren(parentId: string): Promise<HelpCategory[]> {
    const raws = await this.model
      .find({ parentId, isActive: true })
      .sort({ order: 1 })
      .lean();
    return raws.map(HelpCategoryMapper.toDomain);
  }

  async save(entity: HelpCategory): Promise<void> {
    const data = HelpCategoryMapper.toPersistence(entity);
    await this.model.findOneAndUpdate(
      { id: entity.id.toString() },
      { $set: data, $setOnInsert: { _id: new Types.ObjectId().toString() } },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  async findAll(): Promise<HelpCategory[]> { return []; }
  async delete(id: string): Promise<void> { await this.model.deleteOne({ id }); }
}

@Injectable()
export class PrismaHelpArticleRepository implements IHelpArticleRepository {
  constructor(
    @InjectModel('HelpArticle') private readonly model: Model<IHelpArticle>,
  ) {}

  async findById(id: string): Promise<HelpArticle | null> {
    const raw = await this.model.findOne({ id }).lean();
    return raw ? HelpArticleMapper.toDomain(raw) : null;
  }

  async findBySlug(slug: string): Promise<HelpArticle | null> {
    const raw = await this.model.findOne({ slug }).lean();
    return raw ? HelpArticleMapper.toDomain(raw) : null;
  }

  async findByCategory(categoryId: string): Promise<HelpArticle[]> {
    const raws = await this.model
      .find({ categoryId, isActive: true })
      .sort({ order: 1 })
      .lean();
    return raws.map(HelpArticleMapper.toDomain);
  }

  async search(query: string, platform: string, language: string): Promise<HelpArticle[]> {
    const raws = await this.model
      .find({
        platform, language, isActive: true,
        $or: [
          { title:   { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
        ],
      })
      .lean();
    return raws.map(HelpArticleMapper.toDomain);
  }

  async findPopular(platform: string, language: string, limit: number): Promise<HelpArticle[]> {
    const raws = await this.model
      .find({ platform, language, isActive: true })
      .sort({ viewCount: -1 })
      .limit(limit)
      .lean();
    return raws.map(HelpArticleMapper.toDomain);
  }

  async save(entity: HelpArticle): Promise<void> {
    const data = HelpArticleMapper.toPersistence(entity);
    await this.model.findOneAndUpdate(
      { id: entity.id.toString() },
      { $set: data, $setOnInsert: { _id: new Types.ObjectId().toString() } },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  async findAll(): Promise<HelpArticle[]> { return []; }
  async delete(id: string): Promise<void> { await this.model.deleteOne({ id }); }
}
