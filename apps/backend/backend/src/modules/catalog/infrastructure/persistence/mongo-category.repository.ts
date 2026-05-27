// apps/backend/src/modules/catalog/infrastructure/persistence/mongo-category.repository.ts
// Category repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseMongoRepository } from '@barterborsa/shared-persistence/mongodb/base-mongo.repository';
import { Category as CategoryModel, ICategory } from '@barterborsa/shared-persistence/schemas/backend/category.schema';
import { CategoryMapper, CategoryDocument } from './mappers/category.mapper';
import { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import { Category } from '../../domain/entities/category.entity';
import { Slug } from '../../domain/value-objects/slug.vo';

@Injectable()
export class MongoCategoryRepository
  extends BaseMongoRepository<Category, CategoryDocument>
  implements ICategoryRepository
{
  constructor() {
    const model: Model<CategoryDocument> = CategoryModel;
    super(model, {
      toDomain: CategoryMapper.toDomain,
      toPersistence: CategoryMapper.toPersistence,
    });
  }

  async findBySlug(slug: Slug): Promise<Category | null> {
    const doc = await this.model.findOne({ slug: slug.value }).exec();
    return doc ? this.mapper.toDomain(doc) : null;
  }

  async findChildren(parentId: string): Promise<Category[]> {
    const docs = await this.model.find({ parentId }).exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async findRootCategories(): Promise<Category[]> {
    const docs = await this.model.find({ parentId: null }).exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }
}