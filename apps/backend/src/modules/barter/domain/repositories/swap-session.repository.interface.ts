// apps/backend/src/modules/barter/domain/repositories/swap-session.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { SwapSession } from '../entities/swap-session.entity';
import { SwapSessionStatus } from '../enums/swap-session-status.enum';
import { Types } from 'mongoose';

export interface SwapSessionWithRelations {
  id: string;
  tradeOfferId: string;
  initiatorId: string;
  receiverId: string;
  status: SwapSessionStatus;
  collateralAmount: Types.Decimal128;
  deadline: Date;
  initiatedAt: Date;
  updatedAt: Date;
  initiator?: {
    id: string;
    companyName: string;
  };
  receiver?: {
    id: string;
    companyName: string;
  };
  items?: Array<{
    id: string;
    listingId: string;
    quantity: number;
  }>;
}

export interface ISwapSessionRepository extends IRepository<SwapSession> {
  findById(id: string): Promise<SwapSession | null>;
  findByTradeOfferId(tradeOfferId: string): Promise<SwapSession | null>;
  findByInitiatorId(initiatorId: string): Promise<SwapSession[]>;
  findByReceiverId(receiverId: string): Promise<SwapSession[]>;
  findActive(): Promise<SwapSession[]>;
  save(session: SwapSession): Promise<void>;
  findByCompanyWithFilters(companyId: string, skip: number, take: number): Promise<{ items: SwapSession[]; total: number }>;
  findByIdWithRelations(id: string): Promise<SwapSessionWithRelations | null>;
  updateStatus(id: string, status: string): Promise<void>;
  findByStatusAndDeadlineBefore(status: SwapSessionStatus, deadline: Date, limit: number): Promise<SwapSession[]>;
  findByStatusAndPendingReleaseBefore(deadline: Date, limit: number): Promise<SwapSession[]>;
}
