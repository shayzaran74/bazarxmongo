// apps/backend/src/modules/vendor/infrastructure/persistence/mongo-brand.repository.ts
// Brand repository — Mongoose (ADR-005 Faz 2c)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Brand as BrandModel, IBrand } from '@barterborsa/shared-persistence/schemas/backend/brand.schema';

export interface BrandDocument extends IBrand {
  _id?: string;
  status?: string;
  aliases?: string[];
}

@Injectable()
export class MongoBrandRepository {
  private readonly model: Model<BrandDocument>;

  constructor() {
    this.model = BrandModel as Model<BrandDocument>;
  }

  async findById(id: string): Promise<BrandDocument | null> {
    return this.model.findOne({ id }).exec();
  }

  async findByVendorId(vendorId: string): Promise<BrandDocument[]> {
    return this.model.find({ vendorId }).exec();
  }

  async findBySlug(slug: string): Promise<BrandDocument | null> {
    return this.model.findOne({ slug }).exec();
  }

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    aliases?: string[];
    vendorId: string;
    status?: string;
    submittedAt?: Date;
    image?: string;
    documentUrl?: string;
    invoiceChainUrl?: string;
    authorizationUrl?: string;
  }): Promise<BrandDocument> {
    const id = 'brand-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    const doc = new this.model({
      _id: id,
      id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      aliases: data.aliases ?? [],
      vendorId: data.vendorId,
      status: data.status ?? 'PENDING',
      submittedAt: data.submittedAt ?? new Date(),
      image: data.image,
      documentUrl: data.documentUrl,
      invoiceChainUrl: data.invoiceChainUrl,
      authorizationUrl: data.authorizationUrl,
      isOfficial: false,
      isPopular: false,
      popularityScore: 0,
      productCount: 0,
      violationCount: 0,
    });
    await doc.save();
    return doc;
  }

  async update(id: string, data: Partial<{
    description: string;
    aliases: string[];
    image: string;
    documentUrl: string;
  }>): Promise<BrandDocument | null> {
    return this.model.findOneAndUpdate(
      { id },
      { $set: data },
      { new: true }
    ).exec();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ id }).exec();
  }
}