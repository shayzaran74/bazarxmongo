// apps/backend/src/modules/content/domain/repositories/home-quad-card.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { HomeQuadCard } from '../entities/home-quad-card.entity';

export interface IHomeQuadCardRepository extends IRepository<HomeQuadCard> {
  findAllActive(platform: string): Promise<HomeQuadCard[]>;
}
