// apps/backend/src/modules/vendor/domain/repositories/vendor.repository.interface.ts

import { Vendor } from '../entities/vendor.entity';
import { IRepository } from '@barterborsa/shared-core';
import { VendorSlug } from '../value-objects/vendor-slug.vo';

export interface IVendorRepository extends IRepository<Vendor> {
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
}
