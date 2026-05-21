// apps/backend/src/modules/catalog/infrastructure/persistence/mongo-catalog-product.repository.ts
// CatalogProduct repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { safeRegexFilter } from '../../../../common/utils/regex.utils';
import { Model } from 'mongoose';
import { BaseMongoRepository } from '@barterborsa/shared-persistence/mongodb/base-mongo.repository';
import { CatalogProduct as CatalogProductModel, ICatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';
import { CatalogProductMapper, CatalogProductDocument } from './mappers/catalog-product.mapper';
import { ICatalogProductRepository } from '../../domain/repositories/catalog-product.repository.interface';
import { CatalogProduct } from '../../domain/entities/catalog-product.entity';
import { Slug } from '../../domain/value-objects/slug.vo';
import { GTIN } from '../../domain/value-objects/gtin.vo';

@Injectable()
export class MongoCatalogProductRepository
  extends BaseMongoRepository<CatalogProduct, CatalogProductDocument>
  implements ICatalogProductRepository
{
  constructor() {
    const model: Model<CatalogProductDocument> = CatalogProductModel;
    super(model, {
      toDomain: CatalogProductMapper.toDomain,
      toPersistence: CatalogProductMapper.toPersistence,
    });
  }

  async findBySlug(slug: Slug): Promise<CatalogProduct | null> {
    const doc = await this.model.findOne({ slug: slug.value }).exec();
    return doc ? this.mapper.toDomain(doc) : null;
  }

  async findByGTIN(gtin: GTIN): Promise<CatalogProduct | null> {
    const doc = await this.model.findOne({ gtin: gtin.value }).exec();
    return doc ? this.mapper.toDomain(doc) : null;
  }

  async search(params: {
    searchTerm?: string;
    categoryId?: string;
    brand?: string;
    skip?: number;
    take?: number;
  }): Promise<{ items: CatalogProduct[]; total: number }> {
    const filter: Record<string, unknown> = {};
    if (params.categoryId) filter.categoryId = params.categoryId;
    if (params.brand) filter.brand = params.brand;
    if (params.searchTerm) {
      const regex = safeRegexFilter(params.searchTerm);
      if (regex) {
        filter.$or = [
          { name: regex },
          { description: regex },
        ];
      }
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

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    brand?: string;
    gtin?: string;
    status?: string;
  }): Promise<CatalogProduct> {
    const id = 'cp-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    const doc = new this.model({
      _id: id,
      id,
      name: data.name,
      slug: data.slug,
      description: data.description ?? '',
      brand: data.brand ?? 'Bilinmeyen',
      gtin: data.gtin,
      status: data.status ?? 'PENDING',
    });
    await doc.save();
    return this.mapper.toDomain(doc);
  }
}