import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListVendorBannersQuery } from './list-vendor-banners.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoVendorBannerRepository } from '../../infrastructure/persistence/mongo-vendor-banner.repository';

@QueryHandler(ListVendorBannersQuery)
export class ListVendorBannersHandler implements IQueryHandler<ListVendorBannersQuery> {
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly bannerRepo: MongoVendorBannerRepository,
  ) {}

  async execute(query: ListVendorBannersQuery) {
    const vendor = await this.vendorRepo.findByUserId(query.userId);
    if (!vendor) return [];

    const vendorId = vendor.id;

    const docs = await this.bannerRepo.findByVendorId(vendorId);
    return docs.map((doc: unknown) => (doc as { toObject?(): Record<string, unknown> }).toObject?.() ?? doc as Record<string, unknown>);
  }
}
