// apps/financial-service/src/modules/ledger/infrastructure/persistence/mappers/ledger.mapper.ts

import { Injectable } from '@nestjs/common';
import { GeneralLedger as PrismaLedger, LedgerType, Prisma } from '../../../../../generated/client';
import { GeneralLedgerEntry } from '../../../domain/entities/general-ledger-entry.entity';

@Injectable()
export class LedgerMapper {
  toDomain(raw: PrismaLedger): GeneralLedgerEntry {
    // payload: JsonValue | null — sadece nesne olduğunda al, diğer durumlarda undefined
    const payload =
      raw.payload !== null &&
      typeof raw.payload === 'object' &&
      !Array.isArray(raw.payload)
        ? (raw.payload as Record<string, unknown>)
        : undefined;

    return new GeneralLedgerEntry({
      type: raw.type,
      debitAccountId: raw.debitAccountId || undefined,
      creditAccountId: raw.creditAccountId || undefined,
      amount: raw.amount!,
      referenceId: raw.referenceId || undefined,
      refType: raw.refType || undefined,
      note: raw.note || undefined,
      payload,
      createdAt: raw.createdAt,
    }, raw.id);
  }

  toPersistence(entity: GeneralLedgerEntry) {
    return {
      id: entity.id,
      type: entity.type as LedgerType,
      debitAccountId: entity.debitAccountId,
      creditAccountId: entity.creditAccountId,
      amount: entity.amount,
      referenceId: entity.referenceId,
      refType: entity.refType,
      note: entity.note,
      // Record<string, unknown> → Prisma InputJsonValue dönüşümü için double cast
      payload: entity.payload as unknown as Prisma.InputJsonValue | undefined,
      createdAt: entity.createdAt,
    };
  }
}
