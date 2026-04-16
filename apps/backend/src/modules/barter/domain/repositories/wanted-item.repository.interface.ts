// apps/backend/src/modules/barter/domain/repositories/wanted-item.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { WantedItem } from '../entities/wanted-item.entity';

export interface IWantedItemRepository extends IRepository<WantedItem> {
  findById(id: string): Promise<WantedItem | null>;
  findAll(): Promise<WantedItem[]>;
  save(item: WantedItem): Promise<void>;
  delete(id: string): Promise<void>;
}
