// apps/backend/src/modules/catalog/application/queries/get-catalog-product-by-slug/get-catalog-product-by-slug.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCatalogProductBySlugQuery } from './get-catalog-product-by-slug.query';
import { CatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';
import { ProductMedia } from '@barterborsa/shared-persistence/schemas/backend/productMedia.schema';
import { Listing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';

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

    const product = rawProduct.toJSON() as any;
    const listing = product.listings?.[0] ?? null;

    return {
      ...product,
      Brand: product.brands?.[0] ?? null,
      Vendor: listing?.vendor ?? null,
      price: listing ? Number(listing.price) : 0,
      listingId: listing?.id ?? null,
      stock: listing?.stock ?? 0,
      sku: listing?.sku ?? '',
      image: product.media?.[0]?.url ?? null,
      images: product.media?.map((m: any) => m.url) ?? []
    };
  }
}
