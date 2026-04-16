// apps/backend/src/modules/vendor/infrastructure/persistence/prisma-vendor.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { Vendor } from '../../domain/entities/vendor.entity';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { VendorMapper } from './mappers/vendor.mapper';
import { VendorSlug } from '../../domain/value-objects/vendor-slug.vo';

@Injectable()
export class PrismaVendorRepository implements IVendorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Vendor | null> {
    const record = await this.prisma.vendor.findUnique({
      where: { id },
    });
    return record ? VendorMapper.toDomain(record) : null;
  }

  async findByUserId(userId: string): Promise<Vendor | null> {
    const record = await this.prisma.vendor.findUnique({
      where: { userId },
    });
    return record ? VendorMapper.toDomain(record) : null;
  }

  async findBySlug(slug: VendorSlug): Promise<Vendor | null> {
    const record = await this.prisma.vendor.findUnique({
      where: { slug: slug.value },
    });
    return record ? VendorMapper.toDomain(record) : null;
  }

  async findByCompanyId(companyId: string): Promise<Vendor | null> {
    const record = await this.prisma.vendor.findUnique({
      where: { companyId },
    });
    return record ? VendorMapper.toDomain(record) : null;
  }

  async save(vendor: Vendor): Promise<void> {
    const data = VendorMapper.toPersistence(vendor);
    await this.prisma.vendor.upsert({
      where: { id: vendor.id },
      update: data,
      create: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.vendor.delete({
      where: { id },
    });
  }

  async findAll(): Promise<Vendor[]> {
    const records = await this.prisma.vendor.findMany();
    return records.map(r => VendorMapper.toDomain(r));
  }

  async search(params: {
    status?: string;
    tier?: string;
    city?: string;
    searchTerm?: string;
    skip?: number;
    take?: number;
  }): Promise<{ items: Vendor[]; total: number }> {
    const where = {
      ...(params.status && { status: params.status as any }),
      ...(params.tier && { tier: params.tier as any }),
      ...(params.city && { profile: { city: params.city as any } }),
      ...(params.searchTerm && {
        profile: {
          storeName: { contains: params.searchTerm, mode: 'insensitive' as any },
        },
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.vendor.findMany({
        where,
        skip: params.skip,
        take: params.take,
        include: { profile: true },
      }),
      this.prisma.vendor.count({ where }),
    ]);

    return {
      items: items.map(r => VendorMapper.toDomain(r)),
      total,
    };
  }
}
