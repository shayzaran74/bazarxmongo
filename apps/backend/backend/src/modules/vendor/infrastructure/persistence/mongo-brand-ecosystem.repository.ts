// apps/backend/src/modules/vendor/infrastructure/persistence/mongo-brand-ecosystem.repository.ts
// BrandEcosystem repository — Mongoose (ADR-005 Faz 2c)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BrandEcosystem as BrandEcosystemModel, IBrandEcosystem } from '@barterborsa/shared-persistence/schemas/backend/brandEcosystem.schema';

export interface BrandEcosystemDocument extends IBrandEcosystem {
  _id?: string;
}

@Injectable()
export class MongoBrandEcosystemRepository {
  private readonly model: Model<BrandEcosystemDocument>;

  constructor() {
    this.model = BrandEcosystemModel as Model<BrandEcosystemDocument>;
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
}