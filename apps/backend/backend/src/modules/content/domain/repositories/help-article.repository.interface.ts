// apps/backend/src/modules/content/domain/repositories/help-article.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { HelpArticle } from '../entities/help-article.entity';

export interface IHelpArticleRepository extends IRepository<HelpArticle> {
  findBySlug(slug: string): Promise<HelpArticle | null>;
  findByCategory(categoryId: string): Promise<HelpArticle[]>;
  search(query: string, platform: string, language: string): Promise<HelpArticle[]>;
  findPopular(platform: string, language: string, limit: number): Promise<HelpArticle[]>;
}
