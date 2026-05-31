// apps/backend/src/modules/bazarxgo/domain/repositories/go-order.repository.interface.ts

import { IGoOrder, GoOrderStatusValue, GoSettlementStatusValue } from '@barterborsa/shared-persistence';

export interface IGoOrderRepository {
  findById(id: string): Promise<IGoOrder | null>;
  findByUserId(userId: string, page: number, limit: number): Promise<{ items: IGoOrder[]; total: number }>;
  create(data: Omit<IGoOrder, '_id' | 'createdAt' | 'updatedAt'>): Promise<IGoOrder>;
  updateStatus(id: string, status: GoOrderStatusValue): Promise<void>;
  updateSettlementStatus(id: string, settlementStatus: GoSettlementStatusValue): Promise<void>;
  assignHold(id: string, holdId: string): Promise<void>;
}
