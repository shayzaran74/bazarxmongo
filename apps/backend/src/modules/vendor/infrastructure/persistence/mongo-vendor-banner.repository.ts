// apps/backend/src/modules/vendor/infrastructure/persistence/mongo-vendor-banner.repository.ts
// VendorBanner repository — Mongoose (ADR-005 Faz 2c)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { VendorBanner as VendorBannerModel, IVendorBanner } from '@barterborsa/shared-persistence/schemas/backend/vendorBanner.schema';

export interface VendorBannerDocument extends IVendorBanner {
  _id?: string;
  targetCities?: string[];
  targetDistricts?: string[];
  status?: string;
}

@Injectable()
export class MongoVendorBannerRepository {
  private readonly model: Model<VendorBannerDocument>;

  constructor() {
    this.model = VendorBannerModel as Model<VendorBannerDocument>;
  }

  async findById(id: string): Promise<VendorBannerDocument | null> {
    return this.model.findOne({ id }).exec();
  }

  async findByVendorId(vendorId: string): Promise<VendorBannerDocument[]> {
    return this.model.find({ vendorId }).exec();
  }

  async create(data: {
    vendorId: string;
    imageUrl: string;
    linkUrl?: string;
    type?: number;
    template?: string;
    order?: number;
    targetCities?: string[];
    targetDistricts?: string[];
    status?: string;
    isActive?: boolean;
  }): Promise<VendorBannerDocument> {
    const id = 'banner-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    const doc = new this.model({
      _id: id,
      id,
      vendorId: data.vendorId,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl,
      type: data.type ?? 1,
      template: data.template ?? 'A',
      order: data.order ?? 0,
      targetCities: data.targetCities ?? [],
      targetDistricts: data.targetDistricts ?? [],
      status: data.status ?? 'PENDING',
      isActive: data.isActive ?? false,
    });
    await doc.save();
    return doc;
  }

  async update(id: string, data: Partial<{
    imageUrl: string;
    linkUrl: string;
    type: number;
    template: string;
    order: number;
    targetCities: string[];
    targetDistricts: string[];
  }>): Promise<VendorBannerDocument | null> {
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