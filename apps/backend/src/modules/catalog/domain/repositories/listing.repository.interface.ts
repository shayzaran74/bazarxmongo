// apps/backend/src/modules/catalog/domain/repositories/listing.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { Listing } from '../entities/listing.entity';
import { Slug } from '../value-objects/slug.vo';

export interface IListingRepository extends IRepository<Listing> {
  findBySlug(slug: Slug): Promise<Listing | null>;
  findByVendorId(vendorId: string): Promise<Listing[]>;
  findByCatalogProductId(catalogProductId: string): Promise<Listing[]>;
  search(params: {
    vendorId?: string;
    catalogProductId?: string;
    categoryId?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    skip?: number;
    take?: number;
  }): Promise<{ items: Listing[]; total: number }>;
}
