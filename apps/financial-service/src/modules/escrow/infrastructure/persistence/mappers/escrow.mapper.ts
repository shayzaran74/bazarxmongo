// apps/financial-service/src/modules/escrow/infrastructure/persistence/mappers/escrow.mapper.ts

import { Injectable } from '@nestjs/common';
import { Escrow as PrismaEscrow, Prisma } from '../../../../../generated/client';
import { Escrow, EscrowStatus } from '../../../domain/entities/escrow.entity';

@Injectable()
export class EscrowMapper {
  toDomain(raw: PrismaEscrow): Escrow {
    // payoutLog: JsonValue | null — sadece nesne olduğunda al, diğer durumlarda undefined
    const payoutLog =
      raw.payoutLog !== null &&
      typeof raw.payoutLog === 'object' &&
      !Array.isArray(raw.payoutLog)
        ? (raw.payoutLog as Record<string, unknown>)
        : undefined;

    return new Escrow({
      orderId: raw.orderId,
      buyerId: raw.buyerId,
      sellerId: raw.sellerId,
      amount: raw.amount,
      releasedAmount: raw.releasedAmount,
      status: raw.status as EscrowStatus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      releasedAt: raw.releasedAt || undefined,
      payoutLog,
    }, raw.id);
  }

  toPersistence(entity: Escrow) {
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
      // Record<string, unknown> → Prisma InputJsonValue dönüşümü için double cast
      payoutLog: entity.payoutLog as unknown as Prisma.InputJsonValue | undefined,
    };
  }
}
