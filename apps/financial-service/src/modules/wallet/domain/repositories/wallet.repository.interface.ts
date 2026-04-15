// apps/financial-service/src/modules/wallet/domain/repositories/wallet.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { Wallet } from '../entities/wallet.entity';

export interface IWalletRepository extends IRepository<Wallet> {
  findByUserId(userId: string): Promise<Wallet | null>;
}
