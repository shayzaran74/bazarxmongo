// apps/backend/src/modules/barter/domain/repositories/surplus-item.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { SurplusItem } from '../entities/surplus-item.entity';

export interface ISurplusItemRepository extends IRepository<SurplusItem> {
  findById(id: string): Promise<SurplusItem | null>;
  findAll(): Promise<SurplusItem[]>;
  save(item: SurplusItem): Promise<void>;
  delete(id: string): Promise<void>;
}
