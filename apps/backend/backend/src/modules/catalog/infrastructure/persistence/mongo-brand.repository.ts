// apps/backend/src/modules/catalog/infrastructure/persistence/mongo-brand.repository.ts
// Brand repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseMongoRepository } from '@barterborsa/shared-persistence/mongodb/base-mongo.repository';
import { Brand as BrandModel, IBrand } from '@barterborsa/shared-persistence/schemas/backend/brand.schema';
import { BrandMapper, BrandDocument } from './mappers/brand.mapper';
import { IBrandRepository } from '../../domain/repositories/brand.repository.interface';
import { Brand } from '../../domain/entities/brand.entity';
import { Slug } from '../../domain/value-objects/slug.vo';

@Injectable()
export class MongoBrandRepository
  extends BaseMongoRepository<Brand, BrandDocument>
  implements IBrandRepository
{
  constructor() {
    const model: Model<BrandDocument> = BrandModel;
    super(model, {
      toDomain: BrandMapper.toDomain,
      toPersistence: BrandMapper.toPersistence,
    });
  }

  async findBySlug(slug: Slug): Promise<Brand | null> {
    const doc = await this.model.findOne({ slug: slug.value }).exec();
    return doc ? this.mapper.toDomain(doc) : null;
  }

  async findByName(name: string): Promise<Brand | null> {
    const doc = await this.model.findOne({ name }).exec();
    return doc ? this.mapper.toDomain(doc) : null;
  }

  async search(params: { searchTerm?: string; skip?: number; take?: number }): Promise<{ items: Brand[]; total: number }> {
    const filter: Record<string, unknown> = {};
    if (params.searchTerm) {
      filter.name = { $regex: params.searchTerm, $options: 'i' };
    }

    const [docs, total] = await Promise.all([
      this.model.find(filter, {}, { skip: params.skip ?? 0, limit: params.take ?? 20 }),
      this.model.countDocuments(filter),
    ]);

    return {
      items: docs.map(doc => this.mapper.toDomain(doc)),
      total,
    };
  }

  async findApproved(take: number): Promise<Brand[]> {
    const docs = await this.model.find({ status: 'APPROVED' }, {}, { limit: take }).sort({ name: 1 }).exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }
}