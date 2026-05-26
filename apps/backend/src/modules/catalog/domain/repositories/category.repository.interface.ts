// apps/backend/src/modules/catalog/domain/repositories/category.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { Category } from '../entities/category.entity';
import { Slug } from '../value-objects/slug.vo';

export interface ICategoryRepository extends IRepository<Category> {
  findBySlug(slug: Slug): Promise<Category | null>;
  findChildren(parentId: string): Promise<Category[]>;
  findRootCategories(): Promise<Category[]>;
  findByNameOrSlug(input: string): Promise<Category | null>;
}
