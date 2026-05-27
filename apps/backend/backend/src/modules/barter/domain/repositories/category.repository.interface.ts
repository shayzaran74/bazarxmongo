// apps/backend/src/modules/barter/domain/repositories/category.repository.interface.ts

import { ICategory } from '@barterborsa/shared-persistence';

export interface ICategoryRepository {
  findById(id: string): Promise<ICategory | null>;
  findAll(): Promise<ICategory[]>;
  findRootCategories(): Promise<ICategory[]>;
  create(data: {
    name: string;
    slug?: string;
    icon?: string;
    parentId?: string;
    order?: number;
    isActive?: boolean;
  }): Promise<ICategory>;
  update(id: string, data: Partial<{
    name: string;
    slug?: string;
    icon?: string;
    parentId?: string;
    order?: number;
    isActive?: boolean;
  }>): Promise<ICategory>;
  delete(id: string): Promise<void>;
  findWithChildren(parentId: string | null): Promise<ICategory[]>;
}