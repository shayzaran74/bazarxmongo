// apps/backend/src/modules/vendor/application/queries/list-vendor-products.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException, Inject } from '@nestjs/common';
import { ListVendorProductsQuery } from './list-vendor-products.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { IListingRepository } from '../../../catalog/domain/repositories/listing.repository.interface';
import { Listing } from '../../../catalog/domain/entities/listing.entity';

interface ListingItemResponse {
  id: string;
  title: string;
  description?: string;
  price: number;
  stock: number;
  status: string;
  images: string[];
  [key: string]: unknown;
}

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

    const vendorId = vendor.id;

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
      items: result.items.map((l: Listing): ListingItemResponse => {
        const props = l.getProps();
        const images = (props.metadata && typeof props.metadata === 'object' && 'images' in (props.metadata as object))
          ? ((props.metadata as Record<string, unknown>).images as string[] | undefined)?.slice(0, 1) || []
          : [];
        return {
          id: l.id,
          title: props.title,
          description: props.description,
          price: props.price.toValue(),
          stock: props.stock,
          status: props.status,
          images,
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