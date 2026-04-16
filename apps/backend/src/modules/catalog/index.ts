// apps/backend/src/modules/catalog/index.ts
export { CatalogModule } from './catalog.module';
export { GetProductDetailsQuery } from './application/queries/get-product-details/get-product-details.query';
export { GetListingsQuery } from './application/queries/get-listings/get-listings.query';
export { GetProductBySlugQuery } from './application/queries/get-product-by-slug/get-product-by-slug.query';
export type {
  ProductDetailsDto,
  ProductListingItemDto,
  PaginatedListingsDto,
} from './application/dtos/catalog-response.dtos';
