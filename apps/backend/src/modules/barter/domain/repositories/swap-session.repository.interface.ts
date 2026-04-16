// apps/backend/src/modules/barter/domain/repositories/swap-session.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { SwapSession } from '../entities/swap-session.entity';

export interface ISwapSessionRepository extends IRepository<SwapSession> {
  findById(id: string): Promise<SwapSession | null>;
  findByTradeOfferId(tradeOfferId: string): Promise<SwapSession | null>;
  save(session: SwapSession): Promise<void>;
}
