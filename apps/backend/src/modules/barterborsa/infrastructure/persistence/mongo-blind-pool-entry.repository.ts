// apps/backend/src/modules/barterborsa/infrastructure/persistence/mongo-blind-pool-entry.repository.ts
// BlindPoolEntry repository — Mongoose (ADR-005 Faz 2c)

import { Injectable } from '@nestjs/common';
import { Model, Types, ClientSession } from 'mongoose';
import { BlindPoolEntry as BlindPoolEntryModel, IBlindPoolEntry } from '@barterborsa/shared-persistence/schemas/backend/blindPoolEntry.schema';

export interface BlindPoolEntryDocument extends IBlindPoolEntry {
  _id?: string;
}

@Injectable()
export class MongoBlindPoolEntryRepository {
  private readonly model: Model<BlindPoolEntryDocument>;

  constructor() {
    this.model = BlindPoolEntryModel as Model<BlindPoolEntryDocument>;
  }

  async findByPoolId(poolId: string): Promise<BlindPoolEntryDocument[]> {
    return this.model.find({ poolId }).exec();
  }

  async findByPoolAndVendor(poolId: string, vendorId: string): Promise<BlindPoolEntryDocument | null> {
    return this.model.findOne({ poolId, vendorId }).exec();
  }

  async createWithSession(session: ClientSession, data: {
    poolId: string;
    vendorId: string;
    listingId: string;
    quantity: number;
  }): Promise<BlindPoolEntryDocument> {
    const id = 'bpe-' + crypto.randomUUID();
    const doc = new this.model({
      _id: id,
      id,
      poolId: data.poolId,
      vendorId: data.vendorId,
      listingId: data.listingId,
      quantity: Types.Decimal128.fromString(String(data.quantity)),
      isReserved: false,
    });
    await doc.save({ session });
    return doc;
  }
}