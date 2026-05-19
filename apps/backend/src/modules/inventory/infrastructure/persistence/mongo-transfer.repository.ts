// apps/backend/src/modules/inventory/infrastructure/persistence/mongo-transfer.repository.ts
// Transfer repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Transfer as TransferModel } from '@barterborsa/shared-persistence/schemas/backend/transfer.schema';
import { TransferItem as TransferItemModel } from '@barterborsa/shared-persistence/schemas/backend/transferItem.schema';
import { ITransferRepository } from '../../domain/repositories/transfer.repository.interface';

@Injectable()
export class MongoTransferRepository implements ITransferRepository {
  private readonly model: Model<any>;
  private readonly itemModel: Model<any>;

  constructor() {
    this.model = TransferModel;
    this.itemModel = TransferItemModel;
  }

  async findById(id: string): Promise<any | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? doc.toObject() : null;
  }

  async findByVendorId(vendorId: string): Promise<any[]> {
    const docs = await this.model
      .find({ vendorId })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
    return docs.map(doc => doc.toObject());
  }

  async create(data: any): Promise<any> {
    const id = 'tr-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    const doc = await this.model.create({ id, ...data, createdAt: new Date(), updatedAt: new Date() });
    return doc.toObject();
  }

  async update(id: string, data: any): Promise<any | null> {
    const doc = await this.model.findOneAndUpdate({ id }, { $set: { ...data, updatedAt: new Date() } }, { new: true }).exec();
    return doc ? doc.toObject() : null;
  }

  async findAll(): Promise<any[]> {
    const docs = await this.model.find().exec();
    return docs.map(doc => doc.toObject());
  }
}