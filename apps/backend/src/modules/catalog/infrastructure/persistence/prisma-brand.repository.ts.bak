// apps/backend/src/modules/catalog/infrastructure/persistence/prisma-brand.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { IBrandRepository } from '../../domain/repositories/brand.repository.interface';
import { Brand } from '../../domain/entities/brand.entity';
import { BrandMapper } from './mappers/brand.mapper';
import { Slug } from '../../domain/value-objects/slug.vo';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaBrandRepository implements IBrandRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Brand | null> {
    const record = await this.prisma.brand.findUnique({ where: { id } });
    return record ? BrandMapper.toDomain(record) : null;
  }

  async findAll(): Promise<Brand[]> {
    const records = await this.prisma.brand.findMany();
    return records.map(BrandMapper.toDomain);
  }

  async save(brand: Brand): Promise<void> {
    const data: any = {
        name: brand.name,
        slug: brand.slug.value,
        status: brand.getProps().status,
        updatedAt: new Date(),
    };
    await this.prisma.brand.upsert({
      where: { id: brand.id },
      create: { ...data, id: brand.id },
      update: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.brand.delete({ where: { id } });
  }

  async findBySlug(slug: Slug): Promise<Brand | null> {
    const record = await this.prisma.brand.findUnique({ where: { slug: slug.value } });
    return record ? BrandMapper.toDomain(record) : null;
  }

  async findByName(name: string): Promise<Brand | null> {
    const record = await this.prisma.brand.findUnique({ where: { name } });
    return record ? BrandMapper.toDomain(record) : null;
  }

  async search(params: any): Promise<{ items: Brand[]; total: number }> {
     const where = params.searchTerm ? { name: { contains: params.searchTerm, mode: Prisma.QueryMode.insensitive } } : {};
     const [items, total] = await Promise.all([
         this.prisma.brand.findMany({ where, skip: params.skip, take: params.take }),
         this.prisma.brand.count({ where })
     ]);
     return { items: (items as any[]).map(BrandMapper.toDomain), total };
  }
}
