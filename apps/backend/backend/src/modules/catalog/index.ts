// apps/backend/src/modules/catalog/index.ts
export { CatalogModule } from './catalog.module';

// Yaşayan query'ler — bunlar kullanılıyor
export { GetCatalogProductsQuery } from './application/queries/get-catalog-products/get-catalog-products.query';
export { GetCatalogProductBySlugQuery } from './application/queries/get-catalog-product-by-slug/get-catalog-product-by-slug.query';
export { GetCategoryTreeQuery } from './application/queries/get-category-tree/get-category-tree.query';
export { GetListingBySlugQuery } from './application/queries/get-listing-by-slug/get-listing-by-slug.query';

// DTO tipleri — dışarıdan import edenler için
export type {
  ProductDetailsDto,
  ProductListingItemDto,
  PaginatedListingsDto,
  ProductCondition,
} from './application/dtos/catalog-response.dtos';
