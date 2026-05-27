// apps/backend/src/modules/barter/domain/repositories/trade-offer.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { TradeOffer } from '../entities/trade-offer.entity';

export interface TradeOfferWithRelations extends Record<string, unknown> {
  id: string;
  fromCompanyId?: string;
  toCompanyId?: string;
  initiatorId: string;
  receiverId: string;
  status: string;
  cashAmount?: number;
  cashDirection?: string;
  expiresAt: Date;
  offeredItems?: Record<string, unknown>[];
  requestedItems?: Record<string, unknown>[];
}

export interface CreateTradeOfferData {
  fromCompanyId: string;
  toCompanyId: string;
  status: string;
  cashAmount?: number;
  cashDirection?: string;
  cashCurrency?: string;
  message?: string;
  initiatorId: string;
  initiatorType: string;
  receiverId: string;
  receiverType: string;
  expiresAt: Date;
  parentOfferId?: string;
  counterOfferId?: string;
}

export interface ITradeOfferRepository extends IRepository<TradeOffer> {
  findById(id: string): Promise<TradeOffer | null>;
  findAll(): Promise<TradeOffer[]>;
  save(offer: TradeOffer): Promise<void>;
  delete(id: string): Promise<void>;
  listByCompany(companyId: string): Promise<TradeOffer[]>;
  findPending(): Promise<TradeOffer[]>;
  findByCompanyWithFilters(companyId: string, skip: number, take: number, statusFilter?: string[]): Promise<{ items: TradeOffer[]; total: number }>;
  findByIdWithRelations(id: string): Promise<TradeOfferWithRelations | null>;
  updateStatus(id: string, status: string): Promise<void>;
  create(data: CreateTradeOfferData): Promise<TradeOffer>;
  findWithFilters(filter: Record<string, unknown>, skip: number, take: number): Promise<{ items: TradeOffer[]; total: number }>;
}
