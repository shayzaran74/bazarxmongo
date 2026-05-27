// apps/backend/src/modules/catalog/domain/repositories/catalog-product.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { CatalogProduct } from '../entities/catalog-product.entity';
import { Slug } from '../value-objects/slug.vo';
import { GTIN } from '../value-objects/gtin.vo';

export interface ICatalogProductRepository extends IRepository<CatalogProduct> {
  findBySlug(slug: Slug): Promise<CatalogProduct | null>;
  findByGTIN(gtin: GTIN): Promise<CatalogProduct | null>;
  search(params: {
    categoryId?: string;
    brand?: string;
    searchTerm?: string;
    skip?: number;
    take?: number;
  }): Promise<{ items: CatalogProduct[]; total: number }>;
}
