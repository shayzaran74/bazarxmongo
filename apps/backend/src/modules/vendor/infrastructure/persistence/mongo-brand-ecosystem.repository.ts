// apps/backend/src/modules/vendor/infrastructure/persistence/mongo-brand-ecosystem.repository.ts
// BrandEcosystem repository — Mongoose (ADR-005 Faz 2c)

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BrandEcosystem as BrandEcosystemModel, IBrandEcosystem } from '@barterborsa/shared-persistence/schemas/backend/brandEcosystem.schema';
import { BrandEcosystem } from '../../domain/entities/brand-ecosystem.entity';
import { IBrandEcosystemRepository, BrandEcosystemDocument } from '../../domain/repositories/brand-ecosystem.repository.interface';

@Injectable()
export class MongoBrandEcosystemRepository implements IBrandEcosystemRepository {
  private readonly model: Model<BrandEcosystemDocument>;

  constructor(@InjectModel('BrandEcosystem') model: Model<BrandEcosystemDocument>) {
    this.model = model;
  }

  async findById(id: string): Promise<BrandEcosystemDocument | null> {
    return this.model.findOne({ id }).exec();
  }

  async findByOwnerId(ownerId: string): Promise<BrandEcosystemDocument | null> {
    return this.model.findOne({ ownerId }).exec();
  }

  async findAll(): Promise<BrandEcosystemDocument[]> {
    return this.model.find().exec();
  }

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    ownerId: string;
    internalCommRate?: number;
    isBlindPool?: boolean;
  }): Promise<BrandEcosystemDocument> {
    const id = 'eco-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    const doc = new this.model({
      _id: id,
      id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      ownerId: data.ownerId,
      internalCommRate: data.internalCommRate ?? 4.0,
      isBlindPool: data.isBlindPool ?? true,
      status: 'ACTIVE',
    });
    await doc.save();
    return doc;
  }

  async update(id: string, data: Partial<{
    name: string;
    description: string;
    isBlindPool: boolean;
    internalCommRate: number;
  }>): Promise<BrandEcosystemDocument | null> {
    return this.model.findOneAndUpdate(
      { id },
      { $set: data },
      { new: true }
    ).exec();
  }

  async save(entity: BrandEcosystem): Promise<BrandEcosystemDocument> {
    const id = entity.id;
    const props = entity.getProps();
    const existing = await this.model.findOne({ id }).exec();
    if (existing) {
      const updated = await this.model.findOneAndUpdate(
        { id },
        { $set: { ...props, updatedAt: new Date() } },
        { new: true }
      ).exec();
      return updated!;
    }
    const doc = new this.model({ _id: id, id, ...props });
    await doc.save();
    return doc;
  }
}