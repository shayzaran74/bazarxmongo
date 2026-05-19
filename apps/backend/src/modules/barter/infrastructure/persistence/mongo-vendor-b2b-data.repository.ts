// apps/backend/src/modules/barter/infrastructure/persistence/mongo-vendor-b2b-data.repository.ts
// VendorB2BData repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { VendorB2BData as VendorB2BDataModel } from '@barterborsa/shared-persistence/schemas/backend/vendor-b2b-data.schema';
import { IVendorB2BDataRepository } from '../../domain/repositories/vendor-b2b-data.repository.interface';

@Injectable()
export class MongoVendorB2BDataRepository implements IVendorB2BDataRepository {
  private readonly model: Model<any>;

  constructor() {
    this.model = VendorB2BDataModel;
  }

  async updateFirstTransaction(vendorIds: string[]): Promise<void> {
    await this.model.updateMany(
      { vendorId: { $in: vendorIds }, firstTransactionAt: null },
      { $set: { firstTransactionAt: new Date(), updatedAt: new Date() } },
    ).exec();
  }

  async findByVendorId(vendorId: string): Promise<any | null> {
    const doc = await this.model.findOne({ vendorId }).exec();
    return doc ? doc.toObject() : null;
  }

  async updateSubscriptionStatus(vendorId: string, status: string): Promise<void> {
    await this.model.updateMany(
      { vendorId },
      { $set: { subscriptionStatus: status, updatedAt: new Date() } },
    ).exec();
  }
}