// apps/financial-service/src/modules/commission/infrastructure/persistence/mappers/commission.mapper.ts

import { Injectable } from '@nestjs/common';
import { CommissionRecord as PrismaCommission } from '../../../../../generated/client';
import { CommissionRecord } from '../../../domain/entities/commission-record.entity';

@Injectable()
export class CommissionMapper {
  toDomain(raw: PrismaCommission): CommissionRecord {
    return new CommissionRecord({
      orderId: raw.orderId || undefined,
      tradeOfferId: raw.tradeOfferId || undefined,
      vendorId: raw.vendorId,
      vendorTier: raw.vendorTier,
      baseAmount: raw.baseAmount,
      commissionRate: raw.commissionRate,
      commissionAmount: raw.commissionAmount,
      commissionType: raw.commissionType as 'CASH' | 'BARTER',
      status: raw.status as 'CALCULATED' | 'COLLECTED' | 'FAILED',
      createdAt: raw.createdAt,
      collectedAt: raw.collectedAt || undefined,
    }, raw.id);
  }

  toPersistence(entity: CommissionRecord) {
    return {
      orderId: entity.orderId,
      tradeOfferId: entity.tradeOfferId,
      vendorId: entity.vendorId,
      vendorTier: entity.vendorTier,
      baseAmount: entity.baseAmount,
      commissionRate: entity.commissionRate,
      commissionAmount: entity.commissionAmount,
      commissionType: entity.commissionType,
      status: entity.status,
      createdAt: entity.createdAt,
      collectedAt: entity.collectedAt,
    };
  }
}
