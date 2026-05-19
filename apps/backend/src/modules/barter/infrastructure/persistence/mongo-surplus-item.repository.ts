// apps/backend/src/modules/barter/infrastructure/persistence/mongo-surplus-item.repository.ts
// SurplusItem repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseMongoRepository } from '../../../../../../../packages/shared/shared-persistence/src/mongodb/base-mongo.repository';
import { SurplusItem as SurplusItemModel, ISurplusItem } from '../../../../../../../packages/shared/shared-persistence/src/schemas/backend/surplusItem.schema';
import { SurplusItemMapper, SurplusItemDocument } from './mappers/surplus-item.mapper';
import { ISurplusItemRepository } from '../../domain/repositories/surplus-item.repository.interface';
import { SurplusItem } from '../../domain/entities/surplus-item.entity';

@Injectable()
export class MongoSurplusItemRepository
  extends BaseMongoRepository<SurplusItem, ISurplusItem>
  implements ISurplusItemRepository
{
  constructor() {
    const mapper = new SurplusItemMapper();
    super(SurplusItemModel as any, {
      toDomain: mapper.toDomain.bind(mapper) as any,
      toPersistence: mapper.toPersistence.bind(mapper) as any,
    });
  }

  async findByCompanyId(companyId: string): Promise<SurplusItem[]> {
    const docs = await this.model.find({ companyId }).exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async findByStatus(status: string): Promise<SurplusItem[]> {
    const docs = await this.model.find({ status }).exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async findWithFilters(filter: Record<string, unknown>, skip: number, take: number): Promise<{ items: SurplusItem[]; total: number }> {
    const [docs, total] = await Promise.all([
      this.model.find(filter, {}, { skip, limit: take }).sort({ createdAt: -1 }).exec(),
      this.model.countDocuments(filter),
    ]);
    return { items: docs.map(doc => this.mapper.toDomain(doc)), total };
  }

  async findByIdWithCompany(id: string): Promise<any | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? doc.toObject() : null;
  }

  async update(id: string, data: Partial<{
    title: string;
    description: string;
    quantity: number;
    unitPrice: number;
    materialType: string;
    location: string;
    images: unknown;
    wantedCategories: unknown;
    tradeModes: unknown;
    technicalSpecs: unknown;
    status: string;
  }>): Promise<any | null> {
    const doc = await this.model.findOneAndUpdate(
      { id },
      { $set: data },
      { new: true },
    ).exec();
    return doc ? doc.toObject() : null;
  }
}