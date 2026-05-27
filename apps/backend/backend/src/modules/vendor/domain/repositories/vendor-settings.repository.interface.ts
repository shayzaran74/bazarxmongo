// apps/backend/src/modules/vendor/domain/repositories/vendor-settings.repository.interface.ts

import { VendorSettings } from '../entities/vendor-settings.entity';
import { IRepository } from '@barterborsa/shared-core';

export interface IVendorSettingsRepository extends IRepository<VendorSettings> {
  findByVendorId(vendorId: string): Promise<VendorSettings | null>;
  create(data: { vendorId: string; [key: string]: unknown }): Promise<void>;
}
