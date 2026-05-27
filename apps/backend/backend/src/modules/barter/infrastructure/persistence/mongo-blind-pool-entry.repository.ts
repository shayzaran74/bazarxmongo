// apps/backend/src/modules/barter/infrastructure/persistence/mongo-blind-pool-entry.repository.ts
// BlindPoolEntry repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BlindPoolEntry as BlindPoolEntryModel, IBlindPoolEntry } from '@barterborsa/shared-persistence';
import { IBlindPoolEntryRepository } from '../../domain/repositories/blind-pool-entry.repository.interface';

@Injectable()
export class MongoBlindPoolEntryRepository implements IBlindPoolEntryRepository {
  private readonly model: Model<IBlindPoolEntry>;

  constructor() {
    this.model = BlindPoolEntryModel;
  }

  async closeEntriesByVendor(vendorId: string): Promise<void> {
    await this.model.updateMany(
      { vendorId },
      { $set: { quantity: 0, updatedAt: new Date() } },
    ).exec();
  }
}