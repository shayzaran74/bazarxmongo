// apps/backend/src/modules/inventory/infrastructure/persistence/mongo-transfer.repository.ts
// Transfer repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { ITransfer, ITransferItem } from '@barterborsa/shared-persistence';
import { Transfer as TransferModel } from '@barterborsa/shared-persistence/schemas/backend/transfer.schema';
import { TransferItem as TransferItemModel } from '@barterborsa/shared-persistence/schemas/backend/transferItem.schema';
import { ITransferRepository } from '../../domain/repositories/transfer.repository.interface';

export interface TransferSearchResult {
  id: string;
  vendorId: string;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  status: string;
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MongoTransferRepository implements ITransferRepository {
  private readonly model: Model<ITransfer>;
  private readonly itemModel: Model<ITransferItem>;

  constructor() {
    this.model = TransferModel;
    this.itemModel = TransferItemModel;
  }

  async findById(id: string): Promise<TransferSearchResult | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? doc.toObject() as unknown as TransferSearchResult : null;
  }

  async findByVendorId(vendorId: string): Promise<TransferSearchResult[]> {
    const docs = await this.model
      .find({ vendorId })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
    return docs.map(doc => doc.toObject() as unknown as TransferSearchResult);
  }

  async create(data: Record<string, unknown>): Promise<TransferSearchResult> {
    const id = 'tr-' + crypto.randomUUID();
    const doc = await this.model.create({ id, ...data, createdAt: new Date(), updatedAt: new Date() });
    return doc.toObject() as unknown as TransferSearchResult;
  }

  async update(id: string, data: Record<string, unknown>): Promise<TransferSearchResult | null> {
    const doc = await this.model.findOneAndUpdate({ id }, { $set: { ...data, updatedAt: new Date() } }, { new: true }).exec();
    return doc ? doc.toObject() as unknown as TransferSearchResult : null;
  }

  async findAll(): Promise<TransferSearchResult[]> {
    const docs = await this.model.find().exec();
    return docs.map(doc => doc.toObject() as unknown as TransferSearchResult);
  }
}