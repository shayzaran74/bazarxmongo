// apps/backend/src/modules/vendor/domain/repositories/vendor-profile.repository.interface.ts

import { VendorProfile } from '../entities/vendor-profile.entity';
import { IRepository } from '@barterborsa/shared-core';

export interface IVendorProfileRepository extends IRepository<VendorProfile> {
  findByVendorId(vendorId: string): Promise<VendorProfile | null>;
}
