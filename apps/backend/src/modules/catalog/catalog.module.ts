import { Module } from '@nestjs/common';
import { CatalogProductController } from './presentation/catalog-product.controller';
import { CategoryController } from './presentation/category.controller';

@Module({
  controllers: [CatalogProductController, CategoryController],
})
export class CatalogModule {}
