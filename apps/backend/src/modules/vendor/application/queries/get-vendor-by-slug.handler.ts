// apps/backend/src/modules/vendor/application/queries/get-vendor-by-slug.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetVendorBySlugQuery } from './get-vendor-by-slug.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { VendorSlug } from '../../domain/value-objects/vendor-slug.vo';
import { NotFoundException, isErr } from '@barterborsa/shared-core';
import { Inject } from '@nestjs/common';

@QueryHandler(GetVendorBySlugQuery)
export class GetVendorBySlugHandler implements IQueryHandler<GetVendorBySlugQuery> {
  constructor(
    @Inject('IVendorRepository')
    private readonly vendorRepository: IVendorRepository,
  ) {}

  async execute(query: GetVendorBySlugQuery): Promise<any> {
    const slugResult = VendorSlug.create(query.slug);
    if (isErr(slugResult)) {
      throw slugResult.error;
    }

    const vendor = await this.vendorRepository.findBySlug(slugResult.data);
    if (!vendor) {
      throw new NotFoundException('Satıcı bulunamadı.');
    }

    return {
      id: vendor.id,
      slug: vendor.slug.value,
      tier: vendor.tier,
      status: vendor.status,
    };
  }
}
