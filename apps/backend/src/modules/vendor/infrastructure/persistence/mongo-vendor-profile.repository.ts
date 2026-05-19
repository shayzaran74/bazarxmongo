// apps/backend/src/modules/vendor/infrastructure/persistence/mongo-vendor-profile.repository.ts
// VendorProfile repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseMongoRepository } from '../../../../../../../packages/shared/shared-persistence/src/mongodb/base-mongo.repository';
import { VendorProfile as VendorProfileModel, IVendorProfile } from '../../../../../../../packages/shared/shared-persistence/src/schemas/backend/vendorProfile.schema';
import { IVendorProfileRepository } from '../../domain/repositories/vendor-profile.repository.interface';
import { VendorProfile as VendorProfileEntity, OpeningHours } from '../../domain/entities/vendor-profile.entity';

@Injectable()
export class MongoVendorProfileRepository
  extends BaseMongoRepository<VendorProfileEntity, IVendorProfile>
  implements IVendorProfileRepository
{
  constructor() {
    const model: Model<IVendorProfile> = VendorProfileModel;
    super(model, {
      toDomain: (doc) => this.toDomain(doc),
      toPersistence: (entity) => this.toPersistence(entity),
    });
  }

  async findByVendorId(vendorId: string): Promise<VendorProfileEntity | null> {
    const doc = await this.model.findOne({ vendorId }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async updateByVendorId(vendorId: string, data: Partial<{
    storeName: string;
    description: string;
    logo: string;
    banner: string;
    supportEmail: string;
    isFeatured: boolean;
    featuredUntil: Date;
    city: string;
    district: string;
  }>): Promise<void> {
    await this.model.updateOne({ vendorId }, { $set: data }).exec();
  }

  private toDomain(doc: IVendorProfile & { _id?: string }): VendorProfileEntity {
    return VendorProfileEntity.fromPersistence({
      vendorId: doc.vendorId,
      storeName: doc.storeName,
      description: doc.description,
      logo: doc.logo,
      banner: doc.banner,
      supportEmail: doc.supportEmail,
      isFeatured: doc.isFeatured,
      featuredUntil: doc.featuredUntil,
      city: doc.city,
      district: doc.district,
      openingHours: doc.openingHours as OpeningHours | undefined,
      cuisineType: doc.cuisineType,
      deliveryRadius: doc.deliveryRadius,
      minOrderAmount: doc.minOrderAmount ? Number(doc.minOrderAmount.toString()) : undefined,
      avgPrepTimeMinutes: doc.avgPrepTimeMinutes,
    }, doc.id);
  }

  private toPersistence(entity: VendorProfileEntity): Record<string, unknown> {
    const props = entity.getProps();
    return {
      _id: entity.id,
      id: entity.id,
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
      openingHours: props.openingHours,
      cuisineType: props.cuisineType,
      deliveryRadius: props.deliveryRadius,
      minOrderAmount: props.minOrderAmount,
      avgPrepTimeMinutes: props.avgPrepTimeMinutes,
    };
  }
}