// apps/backend/src/modules/catalog/catalog.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ListingController } from './presentation/listing.controller';
import { CreateCategoryHandler } from './application/commands/create-category.handler';
import { CreateListingHandler } from './application/commands/create-listing.handler';
import { PrismaCategoryRepository } from './infrastructure/persistence/prisma-category.repository';
import { PrismaBrandRepository } from './infrastructure/persistence/prisma-brand.repository';
import { PrismaListingRepository } from './infrastructure/persistence/prisma-listing.repository';
import { PrismaCatalogProductRepository } from './infrastructure/persistence/prisma-catalog-product.repository';
import { CreateCatalogProductHandler } from './application/commands/create-catalog-product.handler';
import { CategoryController } from './presentation/category.controller';
import { CatalogProductController } from './presentation/catalog-product.controller';

const CommandHandlers = [CreateCategoryHandler, CreateListingHandler, CreateCatalogProductHandler];
const QueryHandlers: any[] = [];
const Repositories = [
  { provide: 'ICategoryRepository', useClass: PrismaCategoryRepository },
  { provide: 'IBrandRepository', useClass: PrismaBrandRepository },
  { provide: 'IListingRepository', useClass: PrismaListingRepository },
  { provide: 'ICatalogProductRepository', useClass: PrismaCatalogProductRepository },
];

@Module({
  imports: [CqrsModule],
  controllers: [ListingController, CategoryController, CatalogProductController],
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
