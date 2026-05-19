// apps/backend/src/modules/vendor/application/queries/list-vendor-products.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException, Inject } from '@nestjs/common';
import { ListVendorProductsQuery } from './list-vendor-products.query';
import { IVendorRepository } from '../../../vendor/domain/repositories/vendor.repository.interface';
import { IListingRepository } from '../../../catalog/domain/repositories/listing.repository.interface';

@QueryHandler(ListVendorProductsQuery)
export class ListVendorProductsHandler
  implements IQueryHandler<ListVendorProductsQuery> {
  private readonly logger = new Logger(ListVendorProductsHandler.name);

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    @Inject('IListingRepository') private readonly listingRepo: IListingRepository,
  ) {}

  async execute(query: ListVendorProductsQuery) {
    const { userId, filters } = query;
    const { search, page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) throw new NotFoundException('Vendor not found');

    const vendorProps = vendor.getProps();
    const vendorId = (vendorProps as any).id || vendor.id;

    const searchFilter: Record<string, unknown> = {};
    if (search) {
      searchFilter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const result = await this.listingRepo.search({
      vendorId,
      ...searchFilter,
      skip,
      take: limit,
    });

    return {
      items: result.items.map((l: any) => {
        const props = l.getProps ? l.getProps() : l;
        return {
          ...props,
          images: (props as any).images?.slice(0, 1) || [],
        };
      }),
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}