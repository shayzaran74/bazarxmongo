// apps/backend/src/modules/catalog/application/queries/get-catalog-product-by-slug/get-catalog-product-by-slug.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCatalogProductBySlugQuery } from './get-catalog-product-by-slug.query';
import { CatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';
import { ProductMedia } from '@barterborsa/shared-persistence/schemas/backend/productMedia.schema';
import { Listing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';
import { Vendor } from '@barterborsa/shared-persistence/schemas/backend/vendor.schema';
import { populateDynamicBadges } from '../../helpers/badge-evaluator.helper';

interface ProductJson {
  id?: string;
  name?: string;
  slug?: string;
  brands?: Array<{ id: string; name: string }>;
  media?: Array<{ url?: string }>;
  listings?: Array<{ id?: string; vendorId?: string; price?: number; stock?: number; sku?: string; vendor?: unknown }>;
  [key: string]: unknown;
}

@QueryHandler(GetCatalogProductBySlugQuery)
export class GetCatalogProductBySlugHandler implements IQueryHandler<GetCatalogProductBySlugQuery> {
  async execute(query: GetCatalogProductBySlugQuery) {
    const { idOrSlug } = query;
    console.log(`[DEBUG-CP-SLUG] execute called with idOrSlug: "${idOrSlug}"`);

    const isListingId = idOrSlug.startsWith('lst-');
    let targetProductIdOrSlug = idOrSlug;

    console.log(`[DEBUG-CP-SLUG] isListingId: ${isListingId}`);

    if (isListingId) {
      const listingDoc = await Listing.findOne({ id: idOrSlug }).lean().exec();
      console.log(`[DEBUG-CP-SLUG] Listing.findOne search result:`, listingDoc ? { id: listingDoc.id, catalogProductId: listingDoc.catalogProductId } : 'null');
      if (listingDoc) {
        targetProductIdOrSlug = listingDoc.catalogProductId;
      } else {
        console.log(`[DEBUG-CP-SLUG] Listing not found for ID "${idOrSlug}", returning null`);
        return null;
      }
    }

    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetProductIdOrSlug)
      || targetProductIdOrSlug.startsWith('cp-')
      || targetProductIdOrSlug.startsWith('lst-');
    console.log(`[DEBUG-CP-SLUG] targetProductIdOrSlug: "${targetProductIdOrSlug}", isId: ${isId}`);

    const rawProduct = await CatalogProduct.findOne(
      isId ? { id: targetProductIdOrSlug } : { slug: targetProductIdOrSlug }
    )
      .populate('category')
      .populate('media')
      .populate('listings')
      .populate('brands')
      .exec();

    console.log(`[DEBUG-CP-SLUG] CatalogProduct.findOne result exists: ${!!rawProduct}`);
    if (!rawProduct) {
      console.log(`[DEBUG-CP-SLUG] CatalogProduct not found for "${targetProductIdOrSlug}", returning null`);
      return null;
    }

    const product = rawProduct.toJSON() as ProductJson;
    const listing = isListingId
      ? (product.listings?.find((l: any) => l.id === idOrSlug) ?? product.listings?.[0] ?? null)
      : (product.listings?.[0] ?? null);

    console.log(`[DEBUG-CP-SLUG] Primary listing resolved:`, listing ? { id: listing.id, price: listing.price, stock: listing.stock } : 'null');

    let userTier = 'CORE';
    if (listing?.vendorId) {
      const vendor = await Vendor.findOne({ id: listing.vendorId }).lean().exec();
      if (vendor) {
        userTier = (vendor as { tier?: string }).tier || 'CORE';
      }
    }

    const result: Record<string, unknown> = {
      ...product,
      Brand: product.brands?.[0] ?? null,
      Vendor: listing?.vendor ?? null,
      price: listing ? Number(listing.price) : 0,
      listingId: listing?.id ?? null,
      stock: listing?.stock ?? 0,
      sku: listing?.sku ?? '',
      image: product.media?.[0]?.url ?? null,
      images: product.media?.map((m: { url?: string }) => m.url) ?? [],
      userTier
    };

    await populateDynamicBadges([result]);
    return result;
  }
}
