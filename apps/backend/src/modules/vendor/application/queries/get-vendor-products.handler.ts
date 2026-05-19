import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Logger, NotFoundException } from '@nestjs/common';
import { GetVendorProductsQuery } from './get-vendor-products.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { IListingRepository } from '../../../catalog/domain/repositories/listing.repository.interface';

@QueryHandler(GetVendorProductsQuery)
export class GetVendorProductsHandler implements IQueryHandler<GetVendorProductsQuery> {
  private readonly logger = new Logger(GetVendorProductsHandler.name);

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    @Inject('IListingRepository') private readonly listingRepo: IListingRepository,
  ) {}

  async execute(query: GetVendorProductsQuery) {
    const { userId, filters } = query;
    const { search, categoryId, limit = 100 } = filters;

    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    const vendorProps = vendor.getProps();
    const vendorId = (vendorProps as any).id || vendor.id;

    const listings = await this.listingRepo.findByVendorId(vendorId);

    let filtered = listings;
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((l: any) => {
        const p = l.getProps ? l.getProps() : l;
        return ((p as any).title || '').toLowerCase().includes(s) ||
               ((p as any).sku || '').toLowerCase().includes(s);
      });
    }
    if (categoryId) {
      filtered = filtered.filter((l: any) => {
        const p = l.getProps ? l.getProps() : l;
        return (p as any).categoryId === categoryId;
      });
    }

    const result = filtered.slice(0, Number(limit));

    return result.map((l: any) => {
      const p = l.getProps ? l.getProps() : l;
      return {
        id:         (p as any).id || l.id,
        name:       (p as any).title,
        sku:        (p as any).sku,
        price:      Number((p as any).price ?? 0),
        stock:      (p as any).stock,
        status:     (p as any).status,
        image:      null,
        Category:   null,
      };
    });
  }
}
