// apps/backend/src/modules/vendor/application/queries/get-vendor-profile.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetVendorProfileQuery } from './get-vendor-profile.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { IVendorProfile } from '@barterborsa/shared-persistence';

@QueryHandler(GetVendorProfileQuery)
export class GetVendorProfileHandler implements IQueryHandler<GetVendorProfileQuery> {
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    @InjectModel('VendorProfile')  private readonly profileModel: Model<IVendorProfile>,
  ) {}

  async execute(query: GetVendorProfileQuery) {
    const vendor = await this.vendorRepo.findByUserId(query.userId);
    if (!vendor) return null;

    const vendorProps = vendor.getProps() as unknown as Record<string, unknown>;
    const vendorId    = (vendorProps.id as string) ?? vendor.id;

    const profile = await this.profileModel.findOne({ vendorId }).lean();

    return {
      id:         vendorId,
      status:     vendorProps.status,
      vendorType: vendorProps.vendorType,
      tier:       vendorProps.tier,
      slug:       (vendorProps.slug as { value?: string })?.value ?? '',
      storeName:        profile?.storeName        ?? '',
      description:      profile?.description      ?? '',
      logo:             profile?.logo             ?? '',
      banner:           profile?.banner           ?? '',
      supportEmail:     profile?.supportEmail      ?? '',
      city:             profile?.city             ?? '',
      district:         profile?.district         ?? '',
      phone:            profile?.phone            ?? '',
      whatsapp:         profile?.whatsapp         ?? '',
      website:          profile?.website          ?? '',
      address:          profile?.address          ?? '',
      zipCode:          profile?.zipCode          ?? '',
      country:          profile?.country          ?? 'Türkiye',
      bankName:         profile?.bankName         ?? '',
      bankAccountName:  profile?.bankAccountName  ?? '',
      bankIban:         profile?.bankIban         ?? '',
      adProductIdLeft:  profile?.adProductIdLeft  ?? '',
      adProductIdRight: profile?.adProductIdRight ?? '',
      showAd:           profile?.showAd           ?? false,
      showFlashSales:   profile?.showFlashSales   ?? false,
      flashProductIds:  profile?.flashProductIds  ?? [],
      openingHours:     profile?.openingHours     ?? null,
      cuisineType:      profile?.cuisineType      ?? '',
      deliveryRadius:   profile?.deliveryRadius   ?? 5,
      minOrderAmount:   profile?.minOrderAmount
                          ? Number(profile.minOrderAmount.toString())
                          : 0,
      avgDeliveryTime:  profile?.avgPrepTimeMinutes ?? 30,
      lat:              profile?.lat ?? null,
      lng:              profile?.lng ?? null,
      isFeatured:       profile?.isFeatured ?? false,
    };
  }
}
