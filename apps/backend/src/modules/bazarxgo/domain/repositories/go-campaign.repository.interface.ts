// apps/backend/src/modules/bazarxgo/domain/repositories/go-campaign.repository.interface.ts

import { IGoCampaign } from '@barterborsa/shared-persistence';

export interface IGoCampaignRepository {
  findAll(onlyActive?: boolean): Promise<IGoCampaign[]>;
  findById(id: string): Promise<IGoCampaign | null>;
  create(data: Omit<IGoCampaign, '_id' | 'createdAt' | 'updatedAt'>): Promise<IGoCampaign>;
  update(id: string, data: Partial<IGoCampaign>): Promise<IGoCampaign | null>;
  delete(id: string): Promise<void>;
}
