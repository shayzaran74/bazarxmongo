// apps/backend/src/modules/vendor/application/queries/list-vendors.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListVendorsQuery } from './list-vendors.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { PaginatedResult } from '@barterborsa/shared-core';
import { Inject } from '@nestjs/common';

@QueryHandler(ListVendorsQuery)
export class ListVendorsHandler implements IQueryHandler<ListVendorsQuery> {
  constructor(
    @Inject('IVendorRepository')
    private readonly vendorRepository: IVendorRepository,
  ) {}

  async execute(query: ListVendorsQuery): Promise<any> {
    const { params } = query;
    const skip = (Number(params.page || 1) - 1) * Number(params.limit || 10);
    const take = Number(params.limit || 10);

    const { items, total } = await this.vendorRepository.search({
      status: params.status,
      tier: params.tier,
      vendorType: params.vendorType,
      city: params.city,
      searchTerm: params.search,
      skip,
      take,
    });

    return {
      items: items.map(vendor => ({
        id: vendor.id,
        slug: vendor.slug.value,
        tier: vendor.tier,
        status: vendor.status,
        vendorType: vendor.vendorType,
        profile: vendor.profile ? {
          storeName: vendor.profile.storeName,
          description: vendor.profile.description,
          city: vendor.profile.city,
          cuisineType: vendor.profile.cuisineType,
          rating: vendor.profile.rating,
          reviewCount: vendor.profile.reviewCount,
          avgPrepTime: vendor.profile.avgPrepTimeMinutes,
          minOrderAmount: vendor.profile.minOrderAmount,
          deliveryRadius: vendor.profile.deliveryRadius,
          isFeatured: vendor.profile.isFeatured,
          imageUrl: vendor.profile.imageUrl,
        } : null,
      })),
      total,
      page: Number(params.page || 1),
      limit: take,
    };
  }
}
