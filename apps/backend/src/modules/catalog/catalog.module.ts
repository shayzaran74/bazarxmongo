import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@barterborsa/shared-persistence';
import { MediaModule } from '../media/media.module';

// Controllers
import { ListingController } from './presentation/listing.controller';
import { SurplusController } from './presentation/surplus.controller';
import { CategoryController } from './presentation/category.controller';
import { CatalogProductController } from './presentation/catalog-product.controller';
import { BrandController } from './presentation/brand.controller';
import { FavoriteController } from './presentation/favorite.controller';
import { CategoryAdminController } from './presentation/category-admin.controller';
import { ProductAdminController } from './presentation/product-admin.controller';
import { BrandAdminController } from './presentation/brand-admin.controller';
import { ProductTypeAdminController } from './presentation/product-type-admin.controller';
import { ReviewAdminController } from './presentation/review-admin.controller';

// Commands
import { CreateCategoryHandler } from './application/commands/create-category.handler';
import { CreateListingHandler } from './application/commands/create-listing.handler';
import { CreateCatalogProductHandler } from './application/commands/create-catalog-product.handler';
import { DeleteAdminProductHandler } from './application/commands/delete-admin-product.handler';
import { BulkDeleteAdminProductsHandler } from './application/commands/bulk-delete-admin-products.handler';
import { BulkUpdateAdminProductsHandler } from './application/commands/bulk-update-admin-products.handler';
import { UpdateAdminProductHandler } from './application/commands/update-admin-product.handler';
import { DeleteListingHandler } from './application/commands/delete-listing.handler';
import { UpdateListingHandler } from './application/commands/update-listing.handler';
import { CreateAdminProductHandler } from './application/commands/create-admin-product.handler';
import { BulkImportProductsHandler } from './application/commands/bulk-import-products.handler';
import { QueueImportProductsHandler } from './application/commands/queue-import-products.handler';

// Queries
import { GetCategoryTreeHandler } from './application/queries/get-category-tree/get-category-tree.handler';
import { ListCatalogListingsHandler } from './application/queries/list-catalog-listings/list-catalog-listings.handler';
import { GetListingBySlugHandler } from './application/queries/get-listing-by-slug/get-listing-by-slug.handler';
import { GetBrandsHandler } from './application/queries/get-brands/get-brands.handler';
import { GetFavoritesHandler } from './application/queries/get-favorites/get-favorites.handler';
import { ListAdminProductsHandler } from './application/queries/list-admin-products/list-admin-products.handler';
import { ListAdminBrandsHandler } from './application/queries/list-admin-brands/list-admin-brands.handler';
import { GetCatalogProductsHandler } from './application/queries/get-catalog-products/get-catalog-products.handler';
import { GetCatalogProductBySlugHandler } from './application/queries/get-catalog-product-by-slug/get-catalog-product-by-slug.handler';
import { ListAdminReviewsHandler } from './application/queries/list-admin-reviews/list-admin-reviews.handler';
import { GetProductStatsHandler } from './application/queries/get-product-stats.handler';
import { GetImportJobStatusHandler } from './application/queries/get-import-job-status.handler';
import { ListImportJobsHandler } from './application/queries/list-import-jobs.handler';

// Infrastructure
import { PrismaCategoryRepository } from './infrastructure/persistence/prisma-category.repository';
import { PrismaBrandRepository } from './infrastructure/persistence/prisma-brand.repository';
import { PrismaListingRepository } from './infrastructure/persistence/prisma-listing.repository';
import { PrismaCatalogProductRepository } from './infrastructure/persistence/prisma-catalog-product.repository';
import { SystemVendorService } from './infrastructure/services/system-vendor.service';

// Worker
import { ProductImportWorker } from './application/workers/product-import.worker';

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
  BulkImportProductsHandler,
  QueueImportProductsHandler,
];

const QueryHandlers = [
  GetCategoryTreeHandler,
  ListCatalogListingsHandler,
  GetListingBySlugHandler,
  GetBrandsHandler,
  GetFavoritesHandler,
  ListAdminProductsHandler,
  ListAdminBrandsHandler,
  GetCatalogProductsHandler,
  GetCatalogProductBySlugHandler,
  ListAdminReviewsHandler,
  GetProductStatsHandler,
  GetImportJobStatusHandler,
  ListImportJobsHandler,
];

@Module({
  imports: [
    CqrsModule,
    PrismaModule,
    MediaModule,
  ],
  controllers: [
    ListingController,
    SurplusController,
    CategoryController,
    CatalogProductController,
    BrandController,
    FavoriteController,
    CategoryAdminController,
    ProductAdminController,
    BrandAdminController,
    ProductTypeAdminController,
    ReviewAdminController,
  ],
  providers: [
    SystemVendorService,
    ProductImportWorker,
    ...CommandHandlers,
    ...QueryHandlers,
    { provide: 'ICategoryRepository', useClass: PrismaCategoryRepository },
    { provide: 'IBrandRepository', useClass: PrismaBrandRepository },
    { provide: 'IListingRepository', useClass: PrismaListingRepository },
    { provide: 'ICatalogProductRepository', useClass: PrismaCatalogProductRepository },
  ],
  exports: [
    'ICategoryRepository',
    'IBrandRepository',
    'IListingRepository',
    'ICatalogProductRepository',
    SystemVendorService,
  ],
})
export class CatalogModule {}
