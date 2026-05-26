// apps/backend/src/modules/vendor/infrastructure/persistence/mongo-vendor-b2b-data.repository.ts
// VendorB2BData repository — Mongoose (ADR-005 Faz 2c)

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { VendorB2BData as VendorB2BDataModel, IVendorB2BData, B2BSubscriptionStatus } from '@barterborsa/shared-persistence/schemas/backend/vendorB2BData.schema';

export interface VendorB2BDataDocument extends IVendorB2BData {
  _id?: string;
}

@Injectable()
export class MongoVendorB2BDataRepository {
  private readonly model: Model<VendorB2BDataDocument>;

  constructor(@InjectModel('VendorB2BData') model: Model<VendorB2BDataDocument>) {
    this.model = model;
  }

  async findByVendorId(vendorId: string): Promise<VendorB2BDataDocument | null> {
    return this.model.findOne({ vendorId }).exec();
  }

  async updateSubscriptionStatus(vendorId: string, status: string): Promise<void> {
    await this.model.updateOne({ vendorId }, { $set: { subscriptionStatus: status } }).exec();
  }
}
