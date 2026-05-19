// apps/backend/src/modules/vendor/domain/repositories/vendor.repository.interface.ts

import { Vendor } from '../entities/vendor.entity';
import { IRepository } from '@barterborsa/shared-core';
import { VendorSlug } from '../value-objects/vendor-slug.vo';

export interface IVendorRepository extends IRepository<Vendor> {
  create(vendor: Vendor): Promise<Vendor>;
  findByUserId(userId: string): Promise<Vendor | null>;
  findBySlug(slug: VendorSlug): Promise<Vendor | null>;
  findByIdOrSlug(idOrSlug: string): Promise<Vendor | null>;
  findByCompanyId(companyId: string): Promise<Vendor | null>;
  search(params: {
    status?: string;
    tier?: string;
    vendorType?: string;
    city?: string;
    searchTerm?: string;
    skip?: number;
    take?: number;
  }): Promise<{ items: Vendor[]; total: number }>;
  findById(id: string): Promise<Vendor | null>;
  findByIdWithRelations(id: string): Promise<any | null>;
  findByBarterEnabled(enabled: boolean): Promise<Vendor[]>;
  findByTier(tiers: string[]): Promise<Vendor[]>;
  update(id: string, data: Partial<{
    status: string;
    verifiedAt: Date;
    isVerified: boolean;
    barterEnabled: boolean;
    companyId: string;
    ecosystemId: string;
    rejectionReason: string;
    vendorType: string;
  }>): Promise<Vendor | null>;
}
