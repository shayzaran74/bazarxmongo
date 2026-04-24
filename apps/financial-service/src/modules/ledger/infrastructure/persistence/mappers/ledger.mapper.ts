// apps/financial-service/src/modules/ledger/infrastructure/persistence/mappers/ledger.mapper.ts

import { Injectable } from '@nestjs/common';
import { GeneralLedger as PrismaLedger } from '../../../../../generated/client';
import { GeneralLedgerEntry } from '../../../domain/entities/general-ledger-entry.entity';
import { LedgerType } from '../../../../../generated/client';

@Injectable()
export class LedgerMapper {
  toDomain(raw: PrismaLedger): GeneralLedgerEntry {
    return new GeneralLedgerEntry({
      type: raw.type,
      debitAccountId: raw.debitAccountId || undefined,
      creditAccountId: raw.creditAccountId || undefined,
      amount: raw.amount!,
      referenceId: raw.referenceId || undefined,
      refType: raw.refType || undefined,
      note: raw.note || undefined,
      payload: raw.payload,
      createdAt: raw.createdAt,
    }, raw.id);
  }

  toPersistence(entity: GeneralLedgerEntry): any {
    return {
      id: entity.id,
      type: entity.type as LedgerType,
      debitAccountId: entity.debitAccountId,
      creditAccountId: entity.creditAccountId,
      amount: entity.amount,
      referenceId: entity.referenceId,
      refType: entity.refType,
      note: entity.note,
      payload: entity.payload,
      createdAt: entity.createdAt,
    };
  }
}
