// apps/backend/src/modules/catalog/application/queries/get-category-tree/get-category-tree.handler.ts

import { Inject } from '@nestjs/common';
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
  ) {}

  async execute(query: GetCategoryTreeQuery): Promise<CategoryTreeDto[]> {
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

    return rootCategories;
  }
}
