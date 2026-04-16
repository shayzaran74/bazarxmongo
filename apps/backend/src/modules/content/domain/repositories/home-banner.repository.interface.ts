// apps/backend/src/modules/content/domain/repositories/home-banner.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { HomeBanner } from '../entities/home-banner.entity';

export interface IHomeBannerRepository extends IRepository<HomeBanner> {
  findAllActive(platform: string): Promise<HomeBanner[]>;
}
