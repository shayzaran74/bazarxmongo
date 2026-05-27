// apps/backend/src/modules/catalog/infrastructure/persistence/prisma-category.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import { Category } from '../../domain/entities/category.entity';
import { CategoryMapper } from './mappers/category.mapper';
import { Slug } from '../../domain/value-objects/slug.vo';

@Injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Category | null> {
    const record = await this.prisma.category.findUnique({ where: { id } });
    return record ? CategoryMapper.toDomain(record) : null;
  }

  async findAll(): Promise<Category[]> {
    const records = await this.prisma.category.findMany();
    return records.map(CategoryMapper.toDomain);
  }

  async save(category: Category): Promise<void> {
    const data = CategoryMapper.toPersistence(category);
    await this.prisma.category.upsert({
      where: { id: category.id },
      create: data,
      update: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({ where: { id } });
  }

  async findBySlug(slug: Slug): Promise<Category | null> {
    const record = await this.prisma.category.findUnique({ where: { slug: slug.value } });
    return record ? CategoryMapper.toDomain(record) : null;
  }

  async findChildren(parentId: string): Promise<Category[]> {
    const records = await this.prisma.category.findMany({ where: { parentId } });
    return records.map(CategoryMapper.toDomain);
  }

  async findRootCategories(): Promise<Category[]> {
    const records = await this.prisma.category.findMany({ where: { parentId: null } });
    return records.map(CategoryMapper.toDomain);
  }
}
