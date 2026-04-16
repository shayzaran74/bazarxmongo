// apps/backend/src/modules/barter/domain/repositories/trade-offer.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { TradeOffer } from '../entities/trade-offer.entity';

export interface ITradeOfferRepository extends IRepository<TradeOffer> {
  findById(id: string): Promise<TradeOffer | null>;
  findAll(): Promise<TradeOffer[]>;
  save(offer: TradeOffer): Promise<void>;
  delete(id: string): Promise<void>;
  listByCompany(companyId: string): Promise<TradeOffer[]>;
}
