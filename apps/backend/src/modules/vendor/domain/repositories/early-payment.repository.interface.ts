// apps/backend/src/modules/vendor/domain/repositories/early-payment.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { EarlyPaymentRequest } from '../entities/early-payment-request.entity';
import { EarlyPaymentStatus } from '../enums/early-payment-status.enum';

export interface IEarlyPaymentRepository extends IRepository<EarlyPaymentRequest> {
  findById(id: string): Promise<EarlyPaymentRequest | null>;
  findByVendorId(vendorId: string, skip: number, take: number): Promise<{ items: EarlyPaymentRequest[]; total: number }>;
  findByStatus(status: EarlyPaymentStatus, skip: number, take: number): Promise<{ items: EarlyPaymentRequest[]; total: number }>;
  findByVendorAndDateRange(vendorId: string, fromDate: Date, toDate: Date): Promise<EarlyPaymentRequest[]>;
  save(entity: EarlyPaymentRequest): Promise<void>;
}