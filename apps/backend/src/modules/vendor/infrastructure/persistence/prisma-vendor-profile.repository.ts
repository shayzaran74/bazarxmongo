// apps/backend/src/modules/vendor/infrastructure/persistence/prisma-vendor-profile.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { VendorProfile } from '../../domain/entities/vendor-profile.entity';
import { IVendorProfileRepository } from '../../domain/repositories/vendor-profile.repository.interface';

@Injectable()
export class PrismaVendorProfileRepository implements IVendorProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<VendorProfile | null> {
    const record = await this.prisma.vendorProfile.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByVendorId(vendorId: string): Promise<VendorProfile | null> {
    const record = await this.prisma.vendorProfile.findUnique({ where: { vendorId } });
    return record ? this.toDomain(record) : null;
  }

  async save(profile: VendorProfile): Promise<void> {
    const data = this.toPersistence(profile);
    await this.prisma.vendorProfile.upsert({
      where: { vendorId: profile.getProps().vendorId },
      update: data,
      create: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.vendorProfile.delete({ where: { id } });
  }

  async findAll(): Promise<VendorProfile[]> {
    const records = await this.prisma.vendorProfile.findMany();
    return records.map(r => this.toDomain(r));
  }

  private toDomain(record: any): VendorProfile {
    return (VendorProfile as any).fromPersistence({
      vendorId: record.vendorId,
      storeName: record.storeName,
      description: record.description,
      logo: record.logo,
      banner: record.banner,
      supportEmail: record.supportEmail,
      isFeatured: record.isFeatured,
      featuredUntil: record.featuredUntil,
      city: record.city,
      district: record.district,
    }, record.id);
  }

  private toPersistence(profile: VendorProfile): any {
    const props = profile.getProps();
    return {
      vendorId: props.vendorId,
      storeName: props.storeName,
      description: props.description,
      logo: props.logo,
      banner: props.banner,
      supportEmail: props.supportEmail,
      isFeatured: props.isFeatured,
      featuredUntil: props.featuredUntil,
      city: props.city,
      district: props.district,
    };
  }
}

// Note: I need to add fromPersistence to VendorProfile and VendorSettings too.
