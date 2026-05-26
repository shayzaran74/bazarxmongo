// apps/backend/src/modules/vendor/infrastructure/persistence/mongo-inventory-log.repository.ts
// InventoryLog repository — Mongoose (ADR-005 Faz 2c)

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InventoryLog as InventoryLogModel, IInventoryLog } from '@barterborsa/shared-persistence/schemas/backend/inventoryLog.schema';

export interface InventoryLogDocument extends IInventoryLog {
  _id?: string;
}

@Injectable()
export class MongoInventoryLogRepository {
  private readonly model: Model<InventoryLogDocument>;

  constructor(@InjectModel('InventoryLog') model: Model<InventoryLogDocument>) {
    this.model = model;
  }

  async create(data: {
    vendorId: string;
    listingId: string;
    quantity: number;
    type: string;
    reason?: string;
    referenceType?: string;
    referenceId?: string;
  }): Promise<InventoryLogDocument> {
    const id = 'invlog-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    const doc = new this.model({
      _id: id,
      id,
      vendorId: data.vendorId,
      listingId: data.listingId,
      quantity: data.quantity,
      type: data.type,
      reason: data.reason,
      referenceType: data.referenceType,
      referenceId: data.referenceId,
    });
    await doc.save();
    return doc;
  }

  async findByListingId(listingId: string): Promise<InventoryLogDocument[]> {
    return this.model.find({ listingId }).sort({ createdAt: -1 }).exec();
  }

  async findByVendorId(vendorId: string, limit = 50): Promise<InventoryLogDocument[]> {
    return this.model.find({ vendorId }).sort({ createdAt: -1 }).limit(limit).exec();
  }
}