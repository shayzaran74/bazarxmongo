// apps/financial-service/src/modules/ledger/domain/repositories/general-ledger.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { GeneralLedgerEntry } from '../entities/general-ledger-entry.entity';

export interface IGeneralLedgerRepository extends IRepository<GeneralLedgerEntry> {
  findByReferenceId(referenceId: string): Promise<GeneralLedgerEntry[]>;
}
