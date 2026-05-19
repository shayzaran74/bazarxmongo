import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListVendorBrandsQuery } from './list-vendor-brands.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoBrandRepository } from '../../infrastructure/persistence/mongo-brand.repository';

@QueryHandler(ListVendorBrandsQuery)
export class ListVendorBrandsHandler implements IQueryHandler<ListVendorBrandsQuery> {
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly brandRepo: MongoBrandRepository,
  ) {}

  async execute(query: ListVendorBrandsQuery) {
    const vendor = await this.vendorRepo.findByUserId(query.userId);
    if (!vendor) return [];

    const vendorProps = vendor.getProps();
    const vendorId = (vendorProps as any).id || vendor.id;

    const docs = await this.brandRepo.findByVendorId(vendorId);
    return docs.map((doc: any) => doc.toObject ? doc.toObject() : doc);
  }
}
