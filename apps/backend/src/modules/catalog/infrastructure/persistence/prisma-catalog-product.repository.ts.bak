// apps/backend/src/modules/catalog/infrastructure/persistence/prisma-catalog-product.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ICatalogProductRepository } from '../../domain/repositories/catalog-product.repository.interface';
import { CatalogProduct } from '../../domain/entities/catalog-product.entity';
import { CatalogProductMapper } from './mappers/catalog-product.mapper';
import { Slug } from '../../domain/value-objects/slug.vo';
import { GTIN } from '../../domain/value-objects/gtin.vo';

@Injectable()
export class PrismaCatalogProductRepository implements ICatalogProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<CatalogProduct | null> {
    const record = await this.prisma.catalogProduct.findUnique({ where: { id } });
    return record ? CatalogProductMapper.toDomain(record) : null;
  }

  async findAll(): Promise<CatalogProduct[]> {
    const records = await this.prisma.catalogProduct.findMany();
    return records.map(CatalogProductMapper.toDomain);
  }

  async save(product: CatalogProduct): Promise<void> {
    const data = CatalogProductMapper.toPersistence(product);
    await this.prisma.catalogProduct.upsert({
      where: { id: product.id },
      create: data,
      update: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.catalogProduct.delete({ where: { id } });
  }

  async findBySlug(slug: Slug): Promise<CatalogProduct | null> {
    const record = await this.prisma.catalogProduct.findUnique({ where: { slug: slug.value } });
    return record ? CatalogProductMapper.toDomain(record) : null;
  }

  async findByGTIN(gtin: GTIN): Promise<CatalogProduct | null> {
    const record = await this.prisma.catalogProduct.findUnique({ where: { gtin: gtin.value } });
    return record ? CatalogProductMapper.toDomain(record) : null;
  }

  async search(params: any): Promise<{ items: CatalogProduct[]; total: number }> {
    const { skip, take, searchTerm, categoryId, brand } = params;
    
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (brand) where.brand = brand;
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }
    
    const [items, total] = await Promise.all([
      this.prisma.catalogProduct.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.catalogProduct.count({ where }),
    ]);

    return {
      items: items.map(CatalogProductMapper.toDomain),
      total,
    };
  }
}
