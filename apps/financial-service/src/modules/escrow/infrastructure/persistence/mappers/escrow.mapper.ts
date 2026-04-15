// apps/financial-service/src/modules/escrow/infrastructure/persistence/mappers/escrow.mapper.ts

import { Injectable } from '@nestjs/common';
import { Escrow as PrismaEscrow } from '../../../../../generated/client';
import { Escrow } from '../../../domain/entities/escrow.entity';

@Injectable()
export class EscrowMapper {
  toDomain(raw: PrismaEscrow): Escrow {
    return new Escrow({
      orderId: raw.orderId,
      buyerId: raw.buyerId,
      sellerId: raw.sellerId,
      amount: raw.amount,
      releasedAmount: raw.releasedAmount,
      status: raw.status as any,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      releasedAt: raw.releasedAt || undefined,
      payoutLog: raw.payoutLog,
    }, raw.id);
  }

  toPersistence(entity: Escrow): any {
    return {
      orderId: entity.orderId,
      buyerId: entity.buyerId,
      sellerId: entity.sellerId,
      amount: entity.amount,
      releasedAmount: entity.releasedAmount,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      releasedAt: entity.releasedAt,
      payoutLog: entity.payoutLog,
    };
  }
}
