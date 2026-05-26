// apps/backend/src/modules/catalog/catalog.module.ts
// CatalogModule — Mongoose migration (ADR-005 Faz 2a)

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { MediaModule } from '../media/media.module';

// Schemas
import { Listing, ListingSchema } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';
import { Category, CategorySchema } from '@barterborsa/shared-persistence/schemas/backend/category.schema';
import { Brand, BrandSchema } from '@barterborsa/shared-persistence/schemas/backend/brand.schema';
import { CatalogProduct, CatalogProductSchema } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';
import { ListingImage, ListingImageSchema } from '@barterborsa/shared-persistence/schemas/backend/listingImage.schema';
import { ListingStats, ListingStatsSchema } from '@barterborsa/shared-persistence/schemas/backend/listingStats.schema';
import { ListingPriceHistory, ListingPriceHistorySchema } from '@barterborsa/shared-persistence/schemas/backend/listingPriceHistory.schema';
import {
  ImportJobSchema, ProductMediaSchema, VendorSchema,
  CompanySchema, UserSchema, CategoryAttributeSchema,
} from '@barterborsa/shared-persistence';

// Controllers
import { ListingController } from './presentation/listing.controller';

import { CategoryController } from './presentation/category.controller';
import { CatalogProductController } from './presentation/catalog-product.controller';
import { BrandController } from './presentation/brand.controller';
import { FavoriteController } from './presentation/favorite.controller';
import { CategoryAdminController } from './presentation/category-admin.controller';
import { ProductAdminController } from './presentation/product-admin.controller';
import { BrandAdminController } from './presentation/brand-admin.controller';
import { ProductTypeAdminController } from './presentation/product-type-admin.controller';
import { ReviewAdminController } from './presentation/review-admin.controller';
import { BuyboxController, ListingBuyboxController, AdminBuyboxController } from './presentation/buybox.controller';
import { PriceAdvisorController } from './presentation/price-advisor.controller';

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
import { MongoCategoryRepository } from './infrastructure/persistence/mongo-category.repository';
import { MongoBrandRepository } from './infrastructure/persistence/mongo-brand.repository';
import { MongoListingRepository } from './infrastructure/persistence/mongo-listing.repository';
import { MongoCatalogProductRepository } from './infrastructure/persistence/mongo-catalog-product.repository';
import { BuyboxCalculatorService } from './application/services/buybox-calculator.service';
import { BuyboxRecalculateHandler, BUYBOX_RECALCULATE_QUEUE } from './application/handlers/buybox-recalculate.handler';
import { SystemVendorService } from './infrastructure/services/system-vendor.service';
import { BuyboxHistory, BuyboxHistorySchema, VendorStats, VendorStatsSchema } from '@barterborsa/shared-persistence';

// Worker
import { ProductImportWorker } from './application/workers/product-import.worker';
import { MongoVendorRepository } from '../vendor/infrastructure/persistence/mongo-vendor.repository';

// Master Plan §4.4 + §5.3 — Ekosistem kör havuz anonimleştirme servisi
import { AnonymizerService } from '../barterborsa/application/services/anonymizer.service';
import { ImportCategoryResolverService } from './application/services/import-category-resolver.service';
import { ImageImportService } from './application/services/image-import.service';
import { TrendyolImportNormalizerService } from './application/services/trendyol-import-normalizer.service';

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
    BullModule.registerQueue({
      name: BUYBOX_RECALCULATE_QUEUE,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 50,
        removeOnFail: 100,
      },
    }),
    MongooseModule.forFeature([
      { name: 'Listing', schema: ListingSchema },
      { name: 'Category', schema: CategorySchema },
      { name: 'Brand', schema: BrandSchema },
      { name: 'CatalogProduct', schema: CatalogProductSchema },
      { name: 'ListingImage', schema: ListingImageSchema },
      { name: 'ListingStats', schema: ListingStatsSchema },
      { name: 'ListingPriceHistory', schema: ListingPriceHistorySchema },
      { name: 'ImportJob',        schema: ImportJobSchema },
      { name: 'ProductMedia',     schema: ProductMediaSchema },
      { name: 'Vendor',           schema: VendorSchema },
      { name: 'Company',          schema: CompanySchema },
      { name: 'User',             schema: UserSchema },
      { name: 'CategoryAttribute',schema: CategoryAttributeSchema },
      { name: 'BuyboxHistory', schema: BuyboxHistorySchema },
      { name: 'VendorStats', schema: VendorStatsSchema },
    ]),
    MediaModule,
  ],
  controllers: [
    ListingController,

    CategoryController,
    CatalogProductController,
    BrandController,
    FavoriteController,
    CategoryAdminController,
    ProductAdminController,
    BrandAdminController,
    ProductTypeAdminController,
    ReviewAdminController,
    BuyboxController,
    ListingBuyboxController,
    AdminBuyboxController,
    PriceAdvisorController,
  ],
  providers: [
    SystemVendorService,
    ProductImportWorker,
    BuyboxCalculatorService,
    BuyboxRecalculateHandler,
    AnonymizerService,
    ...CommandHandlers,
    ...QueryHandlers,
    { provide: 'ICategoryRepository', useClass: MongoCategoryRepository },
    { provide: 'IBrandRepository', useClass: MongoBrandRepository },
    { provide: 'IListingRepository', useClass: MongoListingRepository },
    { provide: 'ICatalogProductRepository', useClass: MongoCatalogProductRepository },
    { provide: 'IVendorRepository', useClass: MongoVendorRepository },
    ImportCategoryResolverService,
    ImageImportService,
    TrendyolImportNormalizerService,
  ],
  exports: [
    'ICategoryRepository',
    'IBrandRepository',
    'IListingRepository',
    'ICatalogProductRepository',
    SystemVendorService,
    ImportCategoryResolverService,
    ImageImportService,
    TrendyolImportNormalizerService,
  ],
})
export class CatalogModule {}