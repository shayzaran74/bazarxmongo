// apps/backend/src/modules/vendor/infrastructure/persistence/prisma-vendor-profile.repository.ts

import { Injectable } from '@nestjs/common';
import type { Prisma, VendorProfile as VendorProfileRecord } from '@prisma/client';
import { PrismaService } from '@barterborsa/shared-persistence';
import { VendorProfile, type OpeningHours } from '../../domain/entities/vendor-profile.entity';
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
      where:  { vendorId: profile.getProps().vendorId },
      update: data,
      create: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.vendorProfile.delete({ where: { id } });
  }

  async findAll(): Promise<VendorProfile[]> {
    const records = await this.prisma.vendorProfile.findMany();
    return records.map((r) => this.toDomain(r));
  }

  private toDomain(record: VendorProfileRecord): VendorProfile {
    return VendorProfile.fromPersistence(
      {
        vendorId:           record.vendorId,
        storeName:          record.storeName,
        description:        record.description ?? undefined,
        logo:               record.logo ?? undefined,
        banner:             record.banner ?? undefined,
        supportEmail:       record.supportEmail ?? undefined,
        isFeatured:         record.isFeatured,
        featuredUntil:      record.featuredUntil ?? undefined,
        city:               record.city ?? undefined,
        district:           record.district ?? undefined,
        openingHours:       (record.openingHours as OpeningHours | null) ?? undefined,
        cuisineType:        record.cuisineType ?? undefined,
        deliveryRadius:     record.deliveryRadius ?? undefined,
        minOrderAmount:     record.minOrderAmount ? Number(record.minOrderAmount) : undefined,
        avgPrepTimeMinutes: record.avgPrepTimeMinutes ?? undefined,
      },
      record.id,
    );
  }

  private toPersistence(profile: VendorProfile): Prisma.VendorProfileUncheckedCreateInput {
    const props = profile.getProps();
    return {
      vendorId:           props.vendorId,
      storeName:          props.storeName,
      description:        props.description,
      logo:               props.logo,
      banner:             props.banner,
      supportEmail:       props.supportEmail,
      isFeatured:         props.isFeatured,
      featuredUntil:      props.featuredUntil,
      city:               props.city,
      district:           props.district,
      openingHours:       props.openingHours as Prisma.InputJsonValue | undefined,
      cuisineType:        props.cuisineType,
      deliveryRadius:     props.deliveryRadius,
      minOrderAmount:     props.minOrderAmount,
      avgPrepTimeMinutes: props.avgPrepTimeMinutes,
    };
  }
}
