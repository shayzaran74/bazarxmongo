// apps/backend/src/modules/vendor/infrastructure/persistence/mongo-vendor.repository.ts
// Vendor repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseMongoRepository } from '../../../../../../../packages/shared/shared-persistence/src/mongodb/base-mongo.repository';
import { Vendor as VendorModel, IVendor } from '../../../../../../../packages/shared/shared-persistence/src/schemas/backend/vendor.schema';
import { VendorMapper, VendorDocument } from './mappers/vendor.mapper';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { Vendor } from '../../domain/entities/vendor.entity';
import { VendorSlug } from '../../domain/value-objects/vendor-slug.vo';

@Injectable()
export class MongoVendorRepository
  extends BaseMongoRepository<Vendor, IVendor>
  implements IVendorRepository
{
  constructor() {
    super(VendorModel as unknown as Model<IVendor>, {
      toDomain: VendorMapper.toDomain as unknown as (doc: IVendor) => Vendor,
      toPersistence: VendorMapper.toPersistence as unknown as (entity: Vendor) => Partial<IVendor>,
    });
  }

  async findByUserId(userId: string): Promise<Vendor | null> {
    const doc = await this.model.findOne({ userId }).exec();
    return doc ? this.mapper.toDomain(doc) : null;
  }

  async findBySlug(slug: VendorSlug): Promise<Vendor | null> {
    const doc = await this.model.findOne({ slug: slug.value }).exec();
    return doc ? this.mapper.toDomain(doc) : null;
  }

  async findByIdOrSlug(idOrSlug: string): Promise<Vendor | null> {
    const doc = await this.model.findOne({
      $or: [{ id: idOrSlug }, { slug: idOrSlug }],
    }).exec();
    return doc ? this.mapper.toDomain(doc) : null;
  }

  async findByCompanyId(companyId: string): Promise<Vendor | null> {
    const doc = await this.model.findOne({ companyId }).exec();
    return doc ? this.mapper.toDomain(doc) : null;
  }

  async search(params: {
    status?: string;
    tier?: string;
    vendorType?: string;
    city?: string;
    searchTerm?: string;
    skip?: number;
    take?: number;
  }): Promise<{ items: Vendor[]; total: number }> {
    const filter: Record<string, unknown> = {};
    if (params.status) filter.status = params.status;
    if (params.tier) filter.tier = params.tier;
    if (params.vendorType) filter.vendorType = params.vendorType;

    const [docs, total] = await Promise.all([
      this.model.find(filter, {}, { skip: params.skip ?? 0, limit: params.take ?? 20 }),
      this.model.countDocuments(filter),
    ]);

    return {
      items: docs.map(doc => this.mapper.toDomain(doc)),
      total,
    };
  }

  async update(id: string, data: Partial<{
    status: string;
    verifiedAt: Date;
    isVerified: boolean;
    barterEnabled: boolean;
    companyId: string;
    ecosystemId: string;
    rejectionReason: string;
    vendorType: string;
  }>): Promise<Vendor | null> {
    const doc = await this.model.findOneAndUpdate(
      { id },
      { $set: data },
      { new: true }
    ).exec();
    return doc ? this.mapper.toDomain(doc) : null;
  }

  async findById(id: string): Promise<Vendor | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? this.mapper.toDomain(doc) : null;
  }

  async findByIdWithRelations(id: string): Promise<any | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? doc.toObject() : null;
  }

  async findByBarterEnabled(enabled: boolean): Promise<Vendor[]> {
    const docs = await this.model.find({ barterEnabled: enabled }).limit(100).exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async findByTier(tiers: string[]): Promise<Vendor[]> {
    const docs = await this.model.find({ tier: { $in: tiers }, status: 'APPROVED' }).limit(100).exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async create(vendor: Vendor): Promise<Vendor> {
    const persistence = VendorMapper.toPersistence(vendor);
    const doc = await this.model.create(persistence);
    return this.mapper.toDomain(doc);
  }
}