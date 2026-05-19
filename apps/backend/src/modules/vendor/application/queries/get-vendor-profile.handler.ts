import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetVendorProfileQuery } from './get-vendor-profile.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { IVendorProfileRepository } from '../../domain/repositories/vendor-profile.repository.interface';

@QueryHandler(GetVendorProfileQuery)
export class GetVendorProfileHandler implements IQueryHandler<GetVendorProfileQuery> {
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    @Inject('IVendorProfileRepository') private readonly profileRepo: IVendorProfileRepository,
  ) {}

  async execute(query: GetVendorProfileQuery) {
    const vendor = await this.vendorRepo.findByUserId(query.userId);
    if (!vendor) throw new NotFoundException('Vendor not found');

    const vendorProps = vendor.getProps();
    const vendorId = (vendorProps as any).id || vendor.id;

    const profile = await this.profileRepo.findByVendorId(vendorId);
    return profile;
  }
}
