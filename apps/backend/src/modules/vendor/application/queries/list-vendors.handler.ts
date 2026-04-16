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
      })),
      total,
      page: Number(params.page || 1),
      limit: take,
    };
  }
}
