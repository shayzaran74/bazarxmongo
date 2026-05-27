// apps/backend/src/modules/content/domain/repositories/help-category.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { HelpCategory } from '../entities/help-category.entity';

export interface IHelpCategoryRepository extends IRepository<HelpCategory> {
  findBySlug(slug: string): Promise<HelpCategory | null>;
  findAllRoots(platform: string, language: string): Promise<HelpCategory[]>;
  findChildren(parentId: string): Promise<HelpCategory[]>;
}
