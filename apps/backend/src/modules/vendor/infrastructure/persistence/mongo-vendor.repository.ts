// apps/backend/src/modules/vendor/infrastructure/persistence/mongo-vendor.repository.ts
// Vendor repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { Vendor } from '../../domain/entities/vendor.entity';
import { VendorSlug } from '../../domain/value-objects/vendor-slug.vo';
import { VendorMapper } from './mappers/vendor.mapper';

@Injectable()
export class MongoVendorRepository implements IVendorRepository {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  private get model() {
    return this.connection.model('Vendor');
  }

  async findByUserId(userId: string): Promise<Vendor | null> {
    const doc = await this.model.findOne({ userId }).exec();
    return doc ? VendorMapper.toDomain(doc) : null;
  }

  async findBySlug(slug: VendorSlug): Promise<Vendor | null> {
    const doc = await this.model.findOne({ slug: slug.value }).exec();
    return doc ? VendorMapper.toDomain(doc) : null;
  }

  async findByIdOrSlug(idOrSlug: string): Promise<Vendor | null> {
    const doc = await this.model.findOne({
      $or: [{ id: idOrSlug }, { slug: idOrSlug }],
    }).exec();
    return doc ? VendorMapper.toDomain(doc) : null;
  }

  async findByCompanyId(companyId: string): Promise<Vendor | null> {
    const doc = await this.model.findOne({ companyId }).exec();
    return doc ? VendorMapper.toDomain(doc) : null;
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
      items: docs.map(doc => VendorMapper.toDomain(doc)),
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
    return doc ? VendorMapper.toDomain(doc) : null;
  }

  async findById(id: string): Promise<Vendor | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? VendorMapper.toDomain(doc) : null;
  }

  async save(entity: Vendor): Promise<void> {
    const persistence = VendorMapper.toPersistence(entity);
    const { _id, ...updateData } = persistence;
    await this.model.updateOne(
      { id: entity.id },
      { $set: updateData, $setOnInsert: { _id: entity.id } },
      { upsert: true }
    ).exec();
  }

  async findByBarterEnabled(enabled: boolean): Promise<Vendor[]> {
    const docs = await this.model.find({ barterEnabled: enabled }).limit(100).exec();
    return docs.map(doc => VendorMapper.toDomain(doc));
  }

  async findByTier(tiers: string[]): Promise<Vendor[]> {
    const docs = await this.model.find({ tier: { $in: tiers }, status: 'APPROVED' }).limit(100).exec();
    return docs.map(doc => VendorMapper.toDomain(doc));
  }

  async create(vendor: Vendor): Promise<Vendor> {
    const persistence = VendorMapper.toPersistence(vendor);
    const doc = await this.model.create(persistence);
    return VendorMapper.toDomain(doc);
  }

  async findAll(): Promise<Vendor[]> {
    const docs = await this.model.find().exec();
    return docs.map(doc => VendorMapper.toDomain(doc));
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ id }).exec();
  }

  async findByIdWithRelations(id: string): Promise<any | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? doc.toObject() : null;
  }
}