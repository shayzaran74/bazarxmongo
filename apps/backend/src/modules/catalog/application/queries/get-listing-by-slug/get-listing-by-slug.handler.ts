// apps/backend/src/modules/catalog/application/queries/get-listing-by-slug/get-listing-by-slug.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetListingBySlugQuery } from './get-listing-by-slug.query';
import { Listing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';
import { Vendor } from '@barterborsa/shared-persistence/schemas/backend/vendor.schema';
import { CatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';
import { AnonymizerService } from '../../../../barterborsa/application/services/anonymizer.service';
import { populateDynamicBadges } from '../../helpers/badge-evaluator.helper';

interface ListingLean {
  id?: string;
  vendorId?: string;
  ecosystemId?: string;
  catalogProductId?: string;
  [key: string]: unknown;
}

@QueryHandler(GetListingBySlugQuery)
export class GetListingBySlugHandler implements IQueryHandler<GetListingBySlugQuery> {
  constructor(private readonly anonymizer: AnonymizerService) {}

  async execute(query: GetListingBySlugQuery) {
    console.log(`[DEBUG-LST-SLUG] execute called with slug: "${query.slug}"`);
    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query.slug) 
      || /^c[^\s-]{8,}$/i.test(query.slug)
      || query.slug.startsWith('lst-');

    console.log(`[DEBUG-LST-SLUG] isId: ${isId}`);

    const listing = await Listing.findOne(isId ? { id: query.slug } : { slug: query.slug }).lean().exec() as ListingLean | null;
    console.log(`[DEBUG-LST-SLUG] Listing.findOne result exists: ${!!listing}`);
    if (!listing) {
      console.log(`[DEBUG-LST-SLUG] Listing not found for query slug: "${query.slug}", returning null`);
      return null;
    }

    const cp = listing.catalogProductId
      ? await CatalogProduct.findOne({ id: listing.catalogProductId }).lean().exec()
      : null;
    console.log(`[DEBUG-LST-SLUG] CatalogProduct find result exists: ${!!cp}`);

    // Master Plan v4.3 §4.4 + §5.3 — Ekosistem listing'lerinde vendor kimliği gizli
    const isEcosystemListing = Boolean(listing.ecosystemId);
    let vendor: unknown = null;
    let anonymousVendorId: string | undefined;

    if (listing.vendorId) {
      if (isEcosystemListing) {
        anonymousVendorId = this.anonymizer.anonymize(listing.vendorId as string, 'vendor');
        console.log(`[DEBUG-LST-SLUG] Ecosystem listing, anonymizing vendor: ${anonymousVendorId}`);
      } else {
        vendor = await Vendor.findOne({ id: listing.vendorId }).lean().exec();
        console.log(`[DEBUG-LST-SLUG] Normal listing, vendor found: ${!!vendor}`);
      }
    }

    const sanitized: Record<string, unknown> = { ...listing, catalogProduct: cp, vendor };
    sanitized.userTier = (vendor as { tier?: string })?.tier || 'CORE';

    if (isEcosystemListing) {
      delete sanitized.vendorId;
      sanitized.anonymousVendorId = anonymousVendorId;
    }

    await populateDynamicBadges([sanitized]);
    return sanitized;
  }
}