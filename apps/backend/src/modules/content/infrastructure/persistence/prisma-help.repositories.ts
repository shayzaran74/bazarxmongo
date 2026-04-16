// apps/backend/src/modules/content/infrastructure/persistence/prisma-help.repositories.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { IHelpCategoryRepository } from '../../domain/repositories/help-category.repository.interface';
import { IHelpArticleRepository } from '../../domain/repositories/help-article.repository.interface';
import { HelpCategory } from '../../domain/entities/help-category.entity';
import { HelpArticle } from '../../domain/entities/help-article.entity';
import { HelpCategoryMapper, HelpArticleMapper } from './mappers/help.mappers';

@Injectable()
export class PrismaHelpCategoryRepository implements IHelpCategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<HelpCategory | null> {
    const raw = await this.prisma.helpCategory.findUnique({ where: { id } });
    return raw ? HelpCategoryMapper.toDomain(raw) : null;
  }

  async findBySlug(slug: string): Promise<HelpCategory | null> {
    const raw = await this.prisma.helpCategory.findUnique({ where: { slug } });
    return raw ? HelpCategoryMapper.toDomain(raw) : null;
  }

  async findAllRoots(platform: string, language: string): Promise<HelpCategory[]> {
    const raws = await this.prisma.helpCategory.findMany({
      where: { platform: platform as any, language, parentId: null, isActive: true },
      orderBy: { order: 'asc' },
    });
    return raws.map(HelpCategoryMapper.toDomain);
  }

  async findChildren(parentId: string): Promise<HelpCategory[]> {
    const raws = await this.prisma.helpCategory.findMany({
      where: { parentId, isActive: true },
      orderBy: { order: 'asc' },
    });
    return raws.map(HelpCategoryMapper.toDomain);
  }

  async save(entity: HelpCategory): Promise<void> {
    const data = HelpCategoryMapper.toPersistence(entity);
    await this.prisma.helpCategory.upsert({
      where: { id: entity.id.toString() },
      create: data,
      update: data,
    });
  }

  async findAll(): Promise<HelpCategory[]> { return []; }
  async delete(id: string): Promise<void> { await this.prisma.helpCategory.delete({ where: { id } }); }
}

@Injectable()
export class PrismaHelpArticleRepository implements IHelpArticleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<HelpArticle | null> {
    const raw = await this.prisma.helpArticle.findUnique({ where: { id } });
    return raw ? HelpArticleMapper.toDomain(raw) : null;
  }

  async findBySlug(slug: string): Promise<HelpArticle | null> {
    const raw = await this.prisma.helpArticle.findUnique({ where: { slug } });
    return raw ? HelpArticleMapper.toDomain(raw) : null;
  }

  async findByCategory(categoryId: string): Promise<HelpArticle[]> {
    const raws = await this.prisma.helpArticle.findMany({
      where: { categoryId, isActive: true },
      orderBy: { order: 'asc' },
    });
    return raws.map(HelpArticleMapper.toDomain);
  }

  async search(query: string, platform: string, language: string): Promise<HelpArticle[]> {
    const raws = await this.prisma.helpArticle.findMany({
      where: {
        platform: platform as any,
        language,
        isActive: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
    return raws.map(HelpArticleMapper.toDomain);
  }

  async findPopular(platform: string, language: string, limit: number): Promise<HelpArticle[]> {
    const raws = await this.prisma.helpArticle.findMany({
      where: { platform: platform as any, language, isActive: true },
      orderBy: { viewCount: 'desc' },
      take: limit,
    });
    return raws.map(HelpArticleMapper.toDomain);
  }

  async save(entity: HelpArticle): Promise<void> {
    const data = HelpArticleMapper.toPersistence(entity);
    await this.prisma.helpArticle.upsert({
      where: { id: entity.id.toString() },
      create: data,
      update: data,
    });
  }

  async findAll(): Promise<HelpArticle[]> { return []; }
  async delete(id: string): Promise<void> { await this.prisma.helpArticle.delete({ where: { id } }); }
}
