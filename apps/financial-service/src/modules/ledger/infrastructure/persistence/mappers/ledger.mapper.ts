// apps/financial-service/src/modules/ledger/infrastructure/persistence/mappers/ledger.mapper.ts

import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { Decimal } from 'decimal.js';
import { IFinancialGeneralLedger, LedgerEntryTypeType } from '@barterborsa/shared-persistence';
import { GeneralLedgerEntry } from '../../../domain/entities/general-ledger-entry.entity';

const fromD128 = (v: Types.Decimal128 | undefined): Decimal =>
  new Decimal(v ? v.toString() : '0');
const toD128 = (v: Decimal): Types.Decimal128 =>
  Types.Decimal128.fromString(v.toFixed(2));

@Injectable()
export class LedgerMapper {
  toDomain(raw: IFinancialGeneralLedger): GeneralLedgerEntry {
    const payload =
      raw.payload !== null &&
      typeof raw.payload === 'object' &&
      !Array.isArray(raw.payload)
        ? (raw.payload as unknown as Record<string, unknown>)
        : undefined;

    return new GeneralLedgerEntry(
      {
        type:            raw.type as LedgerEntryTypeType,
        debitAccountId:  raw.debitAccountId ?? undefined,
        creditAccountId: raw.creditAccountId ?? undefined,
        amount:          fromD128(raw.amount),
        referenceId:     raw.referenceId ?? undefined,
        refType:         raw.refType ?? undefined,
        note:            raw.note ?? undefined,
        payload,
        createdAt:       raw.createdAt,
      },
      raw.id,
    );
  }

  toPersistence(entity: GeneralLedgerEntry): Partial<IFinancialGeneralLedger> {
    return {
      id:              entity.id,
      type:            entity.type as IFinancialGeneralLedger['type'],
      debitAccountId:  entity.debitAccountId,
      creditAccountId: entity.creditAccountId,
      amount:          toD128(entity.amount),
      referenceId:     entity.referenceId,
      refType:         entity.refType,
      note:            entity.note,
      payload:         entity.payload as IFinancialGeneralLedger['payload'],
      createdAt:       entity.createdAt,
    };
  }
}
