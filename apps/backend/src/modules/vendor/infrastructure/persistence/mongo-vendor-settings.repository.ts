// apps/backend/src/modules/vendor/infrastructure/persistence/mongo-vendor-settings.repository.ts
// VendorSettings repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseMongoRepository } from '../../../../../../../packages/shared/shared-persistence/src/mongodb/base-mongo.repository';
import { VendorSettings as VendorSettingsModel, IVendorSettings } from '../../../../../../../packages/shared/shared-persistence/src/schemas/backend/vendorSettings.schema';
import { IVendorSettingsRepository } from '../../domain/repositories/vendor-settings.repository.interface';
import { VendorSettings as VendorSettingsEntity, CommissionAdjustments } from '../../domain/entities/vendor-settings.entity';

@Injectable()
export class MongoVendorSettingsRepository
  extends BaseMongoRepository<VendorSettingsEntity, IVendorSettings>
  implements IVendorSettingsRepository
{
  constructor(@InjectModel('VendorSettings') vendorSettingsModel: Model<IVendorSettings>) {
    super(vendorSettingsModel, {
      toDomain: (doc) => this.toDomain(doc),
      toPersistence: (entity) => this.toPersistence(entity),
    });
  }

  async findByVendorId(vendorId: string): Promise<VendorSettingsEntity | null> {
    const doc = await this.model.findOne({ vendorId }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async create(data: { vendorId: string; [key: string]: unknown }): Promise<void> {
    const id = 'vs-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    await this.model.create({
      _id: id,
      id,
      vendorId: data.vendorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private toDomain(doc: IVendorSettings & { _id?: string }): VendorSettingsEntity {
    return VendorSettingsEntity.fromPersistence({
      vendorId: doc.vendorId,
      listingLimit: doc.listingLimit,
      commissionRate: doc.commissionRate ? Number(doc.commissionRate.toString()) : 0,
      deliveryTimeDays: doc.deliveryTimeDays,
      minOrderAmount: doc.minOrderAmount ? Number(doc.minOrderAmount.toString()) : 0,
      returnPolicy: doc.returnPolicy,
      shippingPolicy: doc.shippingPolicy,
      preferredCurrency: doc.preferredCurrency,
      vatIncluded: doc.vatIncluded,
      vacationMode: doc.vacationMode,
      vacationEndAt: doc.vacationEndAt,
      autoFulfill: doc.autoFulfill,
      commissionAdjustments: doc.commissionAdjustments as CommissionAdjustments | undefined,
      holidayMode: doc.holidayMode,
      acceptingOrders: doc.acceptingOrders,
    }, doc.id);
  }

  private toPersistence(entity: VendorSettingsEntity): Record<string, unknown> {
    const props = entity.getProps();
    return {
      _id: entity.id,
      id: entity.id,
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
      holidayMode: props.holidayMode,
      acceptingOrders: props.acceptingOrders,
    };
  }
}