// apps/backend/src/modules/catalog/infrastructure/persistence/prisma-listing.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { IListingRepository } from '../../domain/repositories/listing.repository.interface';
import { Listing } from '../../domain/entities/listing.entity';
import { ListingMapper } from './mappers/listing.mapper';
import { Slug } from '../../domain/value-objects/slug.vo';

@Injectable()
export class PrismaListingRepository implements IListingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Listing | null> {
    const record = await this.prisma.listing.findUnique({ where: { id } });
    return record ? ListingMapper.toDomain(record) : null;
  }

  async findAll(): Promise<Listing[]> {
    const records = await this.prisma.listing.findMany();
    return records.map(ListingMapper.toDomain);
  }

  async save(listing: Listing): Promise<void> {
    const data = ListingMapper.toPersistence(listing);
    await this.prisma.listing.upsert({
      where: { id: listing.id },
      create: data,
      update: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.listing.delete({ where: { id } });
  }

  async findBySlug(slug: Slug): Promise<Listing | null> {
    const record = await this.prisma.listing.findUnique({ where: { slug: slug.value } });
    return record ? ListingMapper.toDomain(record) : null;
  }

  async findByVendorId(vendorId: string): Promise<Listing[]> {
    const records = await this.prisma.listing.findMany({ where: { vendorId } });
    return records.map(ListingMapper.toDomain);
  }

  async findByCatalogProductId(catalogProductId: string): Promise<Listing[]> {
    const records = await this.prisma.listing.findMany({ where: { catalogProductId } });
    return records.map(ListingMapper.toDomain);
  }

  async search(params: any): Promise<{ items: Listing[]; total: number }> {
    const { skip, take, ...filters } = params;
    
    const where: any = {};
    if (filters.vendorId) where.vendorId = filters.vendorId;
    if (filters.catalogProductId) where.catalogProductId = filters.catalogProductId;
    if (filters.status) where.status = filters.status;
    
    const [items, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      items: items.map(ListingMapper.toDomain),
      total,
    };
  }
}
