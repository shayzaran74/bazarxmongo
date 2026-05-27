// apps/backend/src/modules/commerce/domain/repositories/return-request.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { ReturnRequest } from '../entities/return-request.entity';
import { ReturnStatus } from '../enums/return-status.enum';

export interface IReturnRequestRepository extends IRepository<ReturnRequest> {
  findById(id: string): Promise<ReturnRequest | null>;
  findByOrderId(orderId: string): Promise<ReturnRequest | null>;
  findByUserId(userId: string, skip: number, take: number): Promise<{ items: ReturnRequest[]; total: number }>;
  findBySellerId(sellerId: string, skip: number, take: number): Promise<{ items: ReturnRequest[]; total: number }>;
  findByStatus(status: ReturnStatus, skip: number, take: number): Promise<{ items: ReturnRequest[]; total: number }>;
  findPendingAutoApprove(deadline: Date, limit: number): Promise<ReturnRequest[]>;
  findByStatusAndSellerDeadlineBefore(status: ReturnStatus, deadline: Date, limit: number): Promise<ReturnRequest[]>;
  save(entity: ReturnRequest): Promise<void>;
}