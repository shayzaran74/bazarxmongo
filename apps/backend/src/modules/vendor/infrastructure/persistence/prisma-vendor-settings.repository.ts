// apps/backend/src/modules/vendor/infrastructure/persistence/prisma-vendor-settings.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { VendorSettings } from '../../domain/entities/vendor-settings.entity';
import { IVendorSettingsRepository } from '../../domain/repositories/vendor-settings.repository.interface';

@Injectable()
export class PrismaVendorSettingsRepository implements IVendorSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<VendorSettings | null> {
    const record = await this.prisma.vendorSettings.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByVendorId(vendorId: string): Promise<VendorSettings | null> {
    const record = await this.prisma.vendorSettings.findUnique({ where: { vendorId } });
    return record ? this.toDomain(record) : null;
  }

  async save(settings: VendorSettings): Promise<void> {
    const data = this.toPersistence(settings);
    await this.prisma.vendorSettings.upsert({
      where: { vendorId: data.vendorId },
      update: data,
      create: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.vendorSettings.delete({ where: { id } });
  }

  async findAll(): Promise<VendorSettings[]> {
    const records = await this.prisma.vendorSettings.findMany();
    return records.map(r => this.toDomain(r));
  }

  private toDomain(record: any): VendorSettings {
    return (VendorSettings as any).fromPersistence({
      vendorId: record.vendorId,
      listingLimit: record.listingLimit,
      commissionRate: Number(record.commissionRate),
      deliveryTimeDays: record.deliveryTimeDays,
      minOrderAmount: Number(record.minOrderAmount),
      returnPolicy: record.returnPolicy,
      shippingPolicy: record.shippingPolicy,
      preferredCurrency: record.preferredCurrency,
      vatIncluded: record.vatIncluded,
      vacationMode: record.vacationMode,
      vacationEndAt: record.vacationEndAt,
      autoFulfill: record.autoFulfill,
      commissionAdjustments: record.commissionAdjustments,
    }, record.id);
  }

  private toPersistence(settings: VendorSettings): any {
    const props = settings.getProps();
    return {
      vendorId: props.vendorId,
      listingLimit: props.listingLimit,
      commissionRate: props.commissionRate,
      deliveryTimeDays: props.deliveryTimeDays,
      minOrderAmount: props.minOrderAmount,
      returnPolicy: props.returnPolicy,
      shippingPolicy: props.shippingPolicy,
      preferredCurrency: props.preferredCurrency,
      vatIncluded: props.vatIncluded,
      vacationMode: props.vacationMode,
      vacationEndAt: props.vacationEndAt,
      autoFulfill: props.autoFulfill,
      commissionAdjustments: props.commissionAdjustments,
    };
  }
}
