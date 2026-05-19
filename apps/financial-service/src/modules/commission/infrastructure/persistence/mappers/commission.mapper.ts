// apps/financial-service/src/modules/commission/infrastructure/persistence/mappers/commission.mapper.ts

import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { Decimal } from 'decimal.js';
import { IFinancialCommissionRecord } from '@barterborsa/shared-persistence';
import { CommissionRecord } from '../../../domain/entities/commission-record.entity';

const fromD128 = (v: Types.Decimal128): Decimal => new Decimal(v.toString());
const toD128 = (v: Decimal): Types.Decimal128 =>
  Types.Decimal128.fromString(v.toFixed(4));

@Injectable()
export class CommissionMapper {
  toDomain(raw: IFinancialCommissionRecord): CommissionRecord {
    return new CommissionRecord(
      {
        orderId:          raw.orderId ?? undefined,
        tradeOfferId:     raw.tradeOfferId ?? undefined,
        vendorId:         raw.vendorId,
        vendorTier:       raw.vendorTier,
        baseAmount:       fromD128(raw.baseAmount),
        commissionRate:   fromD128(raw.commissionRate),
        commissionAmount: fromD128(raw.commissionAmount),
        commissionType:   raw.commissionType as 'CASH' | 'BARTER',
        status:           raw.status as 'CALCULATED' | 'COLLECTED' | 'FAILED',
        createdAt:        raw.createdAt,
        collectedAt:      raw.collectedAt ?? undefined,
      },
      raw.id,
    );
  }

  toPersistence(entity: CommissionRecord): Partial<IFinancialCommissionRecord> {
    return {
      orderId:          entity.orderId,
      tradeOfferId:     entity.tradeOfferId,
      vendorId:         entity.vendorId,
      vendorTier:       entity.vendorTier,
      baseAmount:       toD128(entity.baseAmount),
      commissionRate:   toD128(entity.commissionRate),
      commissionAmount: toD128(entity.commissionAmount),
      commissionType:   entity.commissionType as IFinancialCommissionRecord['commissionType'],
      status:           entity.status as IFinancialCommissionRecord['status'],
      createdAt:        entity.createdAt,
      collectedAt:      entity.collectedAt,
    };
  }
}
