// apps/backend/src/modules/content/domain/repositories/seo-metadata.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { SeoMetadata } from '../entities/seo-metadata.entity';

export interface ISeoMetadataRepository extends IRepository<SeoMetadata> {
  findByPath(path: string, platform: string): Promise<SeoMetadata | null>;
}
