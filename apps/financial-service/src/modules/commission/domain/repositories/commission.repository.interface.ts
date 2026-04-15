// apps/financial-service/src/modules/commission/domain/repositories/commission.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { CommissionRecord } from '../entities/commission-record.entity';

export interface ICommissionRepository extends IRepository<CommissionRecord> {
  findByOrderId(orderId: string): Promise<CommissionRecord | null>;
  findByVendorId(vendorId: string): Promise<CommissionRecord[]>;
}
