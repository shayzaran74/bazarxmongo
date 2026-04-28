// apps/backend/src/modules/catalog/application/queries/get-category-tree/get-category-tree.handler.ts

import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCategoryTreeQuery } from './get-category-tree.query';
import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { Category } from '../../../domain/entities/category.entity';

export interface CategoryTreeDto {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  parentId?: string;
  children: CategoryTreeDto[];
}

@QueryHandler(GetCategoryTreeQuery)
export class GetCategoryTreeHandler implements IQueryHandler<GetCategoryTreeQuery> {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async execute(query: GetCategoryTreeQuery): Promise<CategoryTreeDto[]> {
    const cacheKey = 'category-tree';
    const cachedTree = await this.cacheManager.get<CategoryTreeDto[]>(cacheKey);
    
    if (cachedTree) {
      return cachedTree;
    }

    const allCategories = await this.categoryRepository.findAll();
    
    // Build tree
    const categoryMap = new Map<string, CategoryTreeDto>();
    const rootCategories: CategoryTreeDto[] = [];

    // First pass: create DTOs for all
    allCategories.forEach((cat: Category) => {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        slug: cat.slug.value,
        icon: (cat as any).props.icon,
        parentId: cat.parentId,
        children: []
      });
    });

    // Second pass: link them
    allCategories.forEach((cat: Category) => {
      const dto = categoryMap.get(cat.id)!;
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        categoryMap.get(cat.parentId)!.children.push(dto);
      } else {
        rootCategories.push(dto);
      }
    });

    await this.cacheManager.set(cacheKey, rootCategories, 300000); // 5 min in ms
    return rootCategories;
  }
}
