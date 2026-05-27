// apps/backend/src/modules/vendor/domain/repositories/vendor-profile.repository.interface.ts

import { VendorProfile } from '../entities/vendor-profile.entity';
import { IRepository } from '@barterborsa/shared-core';

export interface IVendorProfileRepository extends IRepository<VendorProfile> {
  findByVendorId(vendorId: string): Promise<VendorProfile | null>;
  updateByVendorId(vendorId: string, data: Partial<{
    storeName: string;
    description: string;
    logo: string;
    banner: string;
    supportEmail: string;
    isFeatured: boolean;
    featuredUntil: Date;
    city: string;
    district: string;
  }>): Promise<void>;
}
