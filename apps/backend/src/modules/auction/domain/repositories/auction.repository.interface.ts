// apps/backend/src/modules/auction/domain/repositories/auction.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { Auction } from '../entities/auction.entity';

export interface IAuctionRepository extends IRepository<Auction> {
  findById(id: string): Promise<Auction | null>;
  findAll(): Promise<Auction[]>;
  save(auction: Auction): Promise<void>;
  delete(id: string): Promise<void>;
}
