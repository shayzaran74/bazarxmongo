// apps/backend/src/modules/content/domain/repositories/dynamic-content.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { DynamicContent } from '../entities/dynamic-content.entity';

export interface IDynamicContentRepository extends IRepository<DynamicContent> {
  findByKey(key: string): Promise<DynamicContent | null>;
}
