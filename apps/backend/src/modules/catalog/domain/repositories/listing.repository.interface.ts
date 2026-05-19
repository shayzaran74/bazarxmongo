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
  findById(id: string): Promise<Listing | null>;
  findByIds(ids: string[]): Promise<Listing[]>;
  reserveStock(listingId: string, quantity: number): Promise<boolean>;
  releaseStock(listingId: string, quantity: number): Promise<void>;
  update(id: string, data: Partial<{ stock: number; status: string; isBuyboxWinner: boolean; buyboxScore: number }>): Promise<Listing | null>;
  create(data: {
    vendorId: string;
    catalogProductId: string;
    title: string;
    description?: string;
    price: number;
    stock: number;
    status: string;
    barcode?: string;
    sku?: string;
    slug?: string;
    categoryId?: string;
  }): Promise<Listing>;
  findByBarcodeOrSku(vendorId: string, barcode?: string, sku?: string): Promise<Listing | null>;
  updateListing(id: string, data: Partial<{ title?: string; description?: string; isAuctionEnabled?: boolean; isLotteryEnabled?: boolean }>): Promise<void>;
  findByProductId(catalogProductId: string): Promise<Listing | null>;
}
