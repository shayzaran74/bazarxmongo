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

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    const rawProduct = await CatalogProduct.findOne(
      isUuid ? { id: idOrSlug } : { slug: idOrSlug }
    )
      .populate('category')
      .populate('media')
      .populate('listings')
      .populate('brands')
      .exec();

    if (!rawProduct) return null;

    const product = rawProduct.toJSON() as ProductJson;
    const listing = product.listings?.[0] ?? null;

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
