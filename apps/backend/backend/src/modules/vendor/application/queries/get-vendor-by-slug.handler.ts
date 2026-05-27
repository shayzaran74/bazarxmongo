// apps/backend/src/modules/vendor/application/queries/get-vendor-by-slug.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetVendorBySlugQuery } from './get-vendor-by-slug.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { NotFoundException } from '@barterborsa/shared-core';
import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IVendorProfile, ICompany } from '@barterborsa/shared-persistence';

export interface GetVendorBySlugResult {
  id: string;
  slug: string;
  tier: string;
  status: string;
  vendorType: string;
  businessName: string;
  description: string;
  logoUrl: string;
  profile: {
    storeName: string;
    description?: string;
    city?: string;
    cuisineType?: string;
    avgPrepTime?: number;
    minOrderAmount?: unknown;
    deliveryRadius?: number;
    isFeatured?: boolean;
    logo?: string | null;
    banner?: string;
  };
}

@QueryHandler(GetVendorBySlugQuery)
export class GetVendorBySlugHandler implements IQueryHandler<GetVendorBySlugQuery> {
  constructor(
    @Inject('IVendorRepository')
    private readonly vendorRepository: IVendorRepository,
    @InjectModel('VendorProfile')
    private readonly profileModel: Model<IVendorProfile>,
    @InjectModel('Company')
    private readonly companyModel: Model<ICompany>,
  ) {}

  async execute(query: GetVendorBySlugQuery): Promise<GetVendorBySlugResult> {
    const vendor = await this.vendorRepository.findByIdOrSlug(query.slug);
    
    if (!vendor) {
      throw new NotFoundException('Satıcı bulunamadı.');
    }

    const props = vendor.getProps() as unknown as Record<string, unknown>;
    const vendorId = (props.id as string) || vendor.id;
    
    const [profile, company] = await Promise.all([
      this.profileModel.findOne({ vendorId }).lean(),
      props.companyId ? this.companyModel.findOne({ id: props.companyId as string }).lean() : null
    ]);
    
    return {
      id: vendor.id,
      slug: vendor.slug.value,
      tier: vendor.tier,
      status: vendor.status,
      vendorType: vendor.vendorType,
      businessName: profile?.storeName || company?.name || (props.businessName as string) || 'İsimsiz Mağaza',
      description: profile?.description || '',
      logoUrl: profile?.logo || company?.logo || '',
      profile: profile ? {
        storeName:      profile.storeName || company?.name || 'İsimsiz Mağaza',
        description:    profile.description,
        city:           profile.city,
        cuisineType:    profile.cuisineType,
        avgPrepTime:    profile.avgPrepTimeMinutes,
        minOrderAmount: profile.minOrderAmount,
        deliveryRadius: profile.deliveryRadius,
        isFeatured:     profile.isFeatured,
        logo:           profile.logo,
        banner:         profile.banner,
      } : {
        storeName: company?.name || 'İsimsiz Mağaza',
        logo: company?.logo || null
      },
    };
  }
}
