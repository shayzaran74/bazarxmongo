// apps/backend/src/modules/barter/domain/repositories/category.repository.interface.ts

export interface ICategoryRepository {
  findById(id: string): Promise<any | null>;
  findAll(): Promise<any[]>;
  findRootCategories(): Promise<any[]>;
  create(data: {
    name: string;
    slug?: string;
    icon?: string;
    parentId?: string;
    order?: number;
    isActive?: boolean;
  }): Promise<any>;
  update(id: string, data: Partial<{
    name: string;
    slug?: string;
    icon?: string;
    parentId?: string;
    order?: number;
    isActive?: boolean;
  }>): Promise<any>;
  delete(id: string): Promise<void>;
  findWithChildren(parentId: string | null): Promise<any[]>;
}