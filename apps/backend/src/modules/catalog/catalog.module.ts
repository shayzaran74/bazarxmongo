// apps/backend/src/modules/catalog/catalog.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
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
import { PRODUCT_REPO } from './domain/repositories/product.repository.interface';
import { PrismaProductRepository } from './infrastructure/persistence/prisma-product.repository';

const CommandHandlers = [
  CreateCategoryHandler, 
  CreateListingHandler, 
  CreateCatalogProductHandler
];

const QueryHandlers = [
  GetProductDetailsHandler,
  GetListingsHandler,
  GetProductBySlugHandler,
  GetCategoryTreeHandler
];

const Repositories = [
  { provide: 'ICategoryRepository', useClass: PrismaCategoryRepository },
  { provide: 'IBrandRepository', useClass: PrismaBrandRepository },
  { provide: 'IListingRepository', useClass: PrismaListingRepository },
  { provide: 'ICatalogProductRepository', useClass: PrismaCatalogProductRepository },
  { provide: PRODUCT_REPO, useClass: PrismaProductRepository },
];

@Module({
  imports: [CqrsModule],
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
  ],
  exports: [...Repositories],
})
export class CatalogModule {}
