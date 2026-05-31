// apps/backend/src/modules/bazarxgo/infrastructure/persistence/mongo-go-campaign.repository.ts

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { GoCampaign, IGoCampaign } from '@barterborsa/shared-persistence';
import { IGoCampaignRepository } from '../../domain/repositories/go-campaign.repository.interface';

@Injectable()
export class MongoGoCampaignRepository implements IGoCampaignRepository {
  async findAll(onlyActive = true): Promise<IGoCampaign[]> {
    const query = onlyActive ? { isActive: true } : {};
    const docs = await GoCampaign.find(query).lean().exec();
    return docs as IGoCampaign[];
  }

  async findById(id: string): Promise<IGoCampaign | null> {
    const doc = await GoCampaign.findOne({ id }).lean().exec();
    return doc as IGoCampaign | null;
  }

  async create(data: Omit<IGoCampaign, '_id' | 'createdAt' | 'updatedAt'>): Promise<IGoCampaign> {
    const id = data.id || randomUUID();
    const doc = await GoCampaign.create({ ...data, _id: id, id });
    return doc.toObject() as IGoCampaign;
  }

  async update(id: string, data: Partial<IGoCampaign>): Promise<IGoCampaign | null> {
    const doc = await GoCampaign.findOneAndUpdate(
      { id },
      { $set: data },
      { new: true },
    ).lean().exec();
    return doc as IGoCampaign | null;
  }

  async delete(id: string): Promise<void> {
    await GoCampaign.deleteOne({ id }).exec();
  }
}
