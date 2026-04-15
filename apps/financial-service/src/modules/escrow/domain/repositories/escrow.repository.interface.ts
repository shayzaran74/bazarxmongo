// apps/financial-service/src/modules/escrow/domain/repositories/escrow.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { Escrow } from '../entities/escrow.entity';

export interface IEscrowRepository extends IRepository<Escrow> {
  findByOrderId(orderId: string): Promise<Escrow | null>;
  findActiveByBuyerId(buyerId: string): Promise<Escrow[]>;
}
