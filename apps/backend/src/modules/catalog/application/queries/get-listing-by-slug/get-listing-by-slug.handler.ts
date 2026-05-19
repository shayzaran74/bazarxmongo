// apps/backend/src/modules/catalog/application/queries/get-listing-by-slug/get-listing-by-slug.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetListingBySlugQuery } from './get-listing-by-slug.query';
import { Listing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';
import { Vendor } from '@barterborsa/shared-persistence/schemas/backend/vendor.schema';
import { CatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';

@QueryHandler(GetListingBySlugQuery)
export class GetListingBySlugHandler implements IQueryHandler<GetListingBySlugQuery> {
  async execute(query: GetListingBySlugQuery) {
    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query.slug) || /^c[^\s-]{8,}$/i.test(query.slug);

    const listing = await Listing.findOne(isId ? { id: query.slug } : { slug: query.slug }).lean().exec();
    if (!listing) return null;

    const cp = listing.catalogProductId
      ? await CatalogProduct.findOne({ id: listing.catalogProductId }).lean().exec()
      : null;
    const vendor = (listing as any).vendorId
      ? await Vendor.findOne({ id: (listing as any).vendorId }).lean().exec()
      : null;

    return { ...listing, catalogProduct: cp, vendor };
  }
}
