// apps/backend/src/modules/catalog/catalog.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@barterborsa/shared-persistence';
import { ListingController } from './presentation/listing.controller';
import { SurplusController } from './presentation/surplus.controller';
import { CreateCategoryHandler } from './application/commands/create-category.handler';
import { CreateListingHandler } from './application/commands/create-listing.handler';
import { PrismaCategoryRepository } from './infrastructure/persistence/prisma-category.repository';
import { PrismaBrandRepository } from './infrastructure/persistence/prisma-brand.repository';
import { PrismaListingRepository } from './infrastructure/persistence/prisma-listing.repository';
import { PrismaCatalogProductRepository } from './infrastructure/persistence/prisma-catalog-product.repository';
import { CreateCatalogProductHandler } from './application/commands/create-catalog-product.handler';
import { CategoryController } from './presentation/category.controller';
import { CatalogProductController } from './presentation/catalog-product.controller';
import { CatalogController } from './presentation/catalog.controller';
import { BrandController } from './presentation/brand.controller';
import { FavoriteController } from './presentation/favorite.controller';
import { CategoryAdminController } from './presentation/category-admin.controller';
import { ProductAdminController } from './presentation/product-admin.controller';
import { BrandAdminController } from './presentation/brand-admin.controller';
import { ProductTypeAdminController } from './presentation/product-type-admin.controller';
import { ReviewAdminController } from './presentation/review-admin.controller';

// Queries
import { GetProductDetailsHandler } from './application/queries/get-product-details/get-product-details.handler';
import { GetListingsHandler } from './application/queries/get-listings/get-listings.handler';
import { GetProductBySlugHandler } from './application/queries/get-product-by-slug/get-product-by-slug.handler';
import { GetCategoryTreeHandler } from './application/queries/get-category-tree/get-category-tree.handler';
import { ListCatalogListingsHandler } from './application/queries/list-catalog-listings/list-catalog-listings.handler';
import { GetListingBySlugHandler } from './application/queries/get-listing-by-slug/get-listing-by-slug.handler';
import { PassthroughMediaService } from './infrastructure/services/passthrough-media.service';
import { MEDIA_SERVICE } from './domain/services/media.service.interface';
import { GetCatalogProductsHandler } from './application/queries/get-catalog-products/get-catalog-products.handler';
import { GetCatalogProductBySlugHandler } from './application/queries/get-catalog-product-by-slug/get-catalog-product-by-slug.handler';
import { GetBrandsHandler } from './application/queries/get-brands/get-brands.handler';
import { GetFavoritesHandler } from './application/queries/get-favorites/get-favorites.handler';
import { ListAdminProductsHandler } from './application/queries/list-admin-products/list-admin-products.handler';
import { DeleteAdminProductHandler } from './application/commands/delete-admin-product.handler';
import { BulkDeleteAdminProductsHandler } from './application/commands/bulk-delete-admin-products.handler';
import { BulkUpdateAdminProductsHandler } from './application/commands/bulk-update-admin-products.handler';
import { UpdateAdminProductHandler } from './application/commands/update-admin-product.handler';
import { ListAdminBrandsHandler } from './application/queries/list-admin-brands/list-admin-brands.handler';
import { ListAdminReviewsHandler } from './application/queries/list-admin-reviews/list-admin-reviews.handler';
import { DeleteListingHandler } from './application/commands/delete-listing.handler';
import { UpdateListingHandler } from './application/commands/update-listing.handler';
import { PRODUCT_REPO } from './domain/repositories/product.repository.interface';
import { PrismaProductRepository } from './infrastructure/persistence/prisma-product.repository';

import { CreateAdminProductHandler } from './application/commands/create-admin-product.handler';

const CommandHandlers = [
  CreateCategoryHandler, 
  CreateListingHandler, 
  CreateCatalogProductHandler,
  DeleteAdminProductHandler,
  BulkDeleteAdminProductsHandler,
  BulkUpdateAdminProductsHandler,
  UpdateAdminProductHandler,
  DeleteListingHandler,
  UpdateListingHandler,
  CreateAdminProductHandler,
];

const QueryHandlers = [
  GetProductDetailsHandler,
  GetListingsHandler,
  GetProductBySlugHandler,
  GetCategoryTreeHandler,
  ListCatalogListingsHandler,
  GetListingBySlugHandler,
  GetCatalogProductsHandler,
  GetCatalogProductBySlugHandler,
  GetBrandsHandler,
  GetFavoritesHandler,
  ListAdminProductsHandler,
  ListAdminBrandsHandler,
  ListAdminReviewsHandler,
];

const Repositories = [
  { provide: 'ICategoryRepository', useClass: PrismaCategoryRepository },
  { provide: 'IBrandRepository', useClass: PrismaBrandRepository },
  { provide: 'IListingRepository', useClass: PrismaListingRepository },
  { provide: 'ICatalogProductRepository', useClass: PrismaCatalogProductRepository },
  { provide: PRODUCT_REPO, useClass: PrismaProductRepository },
];

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [
    ListingController, 
    SurplusController,
    CategoryController, 
    CatalogProductController,
    CatalogController,
    BrandController,
    FavoriteController,
    CategoryAdminController,
    ProductAdminController,
    BrandAdminController,
    ProductTypeAdminController,
    ReviewAdminController
  ],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...Repositories,
    PrismaCategoryRepository,
    PrismaBrandRepository,
    PrismaListingRepository,
    PrismaCatalogProductRepository,
    {
      provide: MEDIA_SERVICE,
      useClass: PassthroughMediaService,
    },
  ],
  exports: [
    ...Repositories,
    MEDIA_SERVICE,
  ],
})
export class CatalogModule {}
