// apps/backend/src/modules/auction/domain/repositories/lottery.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { Lottery } from '../entities/lottery.entity';

export interface ILotteryRepository extends IRepository<Lottery> {
  findById(id: string): Promise<Lottery | null>;
  findAll(): Promise<Lottery[]>;
  save(lottery: Lottery): Promise<void>;
  delete(id: string): Promise<void>;
}
