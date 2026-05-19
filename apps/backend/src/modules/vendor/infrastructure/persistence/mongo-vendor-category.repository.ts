// apps/backend/src/modules/vendor/infrastructure/persistence/mongo-vendor-category.repository.ts
// VendorCategory repository — Mongoose (junction table, no domain entity)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { VendorCategory as VendorCategoryModel, IVendorCategory } from '@barterborsa/shared-persistence/schemas/backend/vendorCategory.schema';

export interface VendorCategoryDocument extends IVendorCategory {
  _id?: string;
}

@Injectable()
export class MongoVendorCategoryRepository {
  private readonly model: Model<VendorCategoryDocument>;

  constructor() {
    this.model = VendorCategoryModel as Model<VendorCategoryDocument>;
  }

  async create(data: { vendorId: string; categoryId: string }): Promise<void> {
    await this.model.updateOne(
      { vendorId: data.vendorId, categoryId: data.categoryId },
      { $set: { vendorId: data.vendorId, categoryId: data.categoryId } },
      { upsert: true }
    );
  }

  async delete(vendorId: string, categoryId: string): Promise<void> {
    await this.model.deleteOne({ vendorId, categoryId });
  }
}