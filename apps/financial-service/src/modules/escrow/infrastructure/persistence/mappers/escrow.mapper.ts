// apps/financial-service/src/modules/escrow/infrastructure/persistence/mappers/escrow.mapper.ts

import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { Decimal } from 'decimal.js';
import { IFinancialEscrow } from '@barterborsa/shared-persistence';
import { Escrow, EscrowStatus } from '../../../domain/entities/escrow.entity';

const fromD128 = (v: Types.Decimal128): Decimal => new Decimal(v.toString());
const toD128 = (v: Decimal): Types.Decimal128 =>
  Types.Decimal128.fromString(v.toFixed(2));

@Injectable()
export class EscrowMapper {
  toDomain(raw: IFinancialEscrow): Escrow {
    const payoutLog =
      raw.payoutLog !== null &&
      typeof raw.payoutLog === 'object' &&
      !Array.isArray(raw.payoutLog)
        ? (raw.payoutLog as unknown as Record<string, unknown>)
        : undefined;

    return new Escrow(
      {
        orderId:        raw.orderId,
        buyerId:        raw.buyerId,
        sellerId:       raw.sellerId,
        amount:         fromD128(raw.amount),
        releasedAmount: fromD128(raw.releasedAmount),
        status:         raw.status as EscrowStatus,
        createdAt:      raw.createdAt,
        updatedAt:      raw.updatedAt,
        releasedAt:     raw.releasedAt ?? undefined,
        payoutLog,
      },
      raw.id,
    );
  }

  toPersistence(entity: Escrow): Partial<IFinancialEscrow> {
    return {
      orderId:        entity.orderId,
      buyerId:        entity.buyerId,
      sellerId:       entity.sellerId,
      amount:         toD128(entity.amount),
      releasedAmount: toD128(entity.releasedAmount),
      status:         entity.status as IFinancialEscrow['status'],
      createdAt:      entity.createdAt,
      updatedAt:      entity.updatedAt,
      releasedAt:     entity.releasedAt,
      payoutLog:      entity.payoutLog as IFinancialEscrow['payoutLog'],
    };
  }
}
