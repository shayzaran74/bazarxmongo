// apps/backend/src/modules/barter/infrastructure/persistence/mappers/swap-session.mapper.ts
// SwapSessionMapper — Prisma → Mongoose (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { ISwapSession, CollateralStatus } from '@barterborsa/shared-persistence/schemas/backend/swapSession.schema';
import { SwapSession, SwapSessionProps } from '../../../domain/entities/swap-session.entity';
import { SwapSessionStatus } from '../../../domain/enums/swap-session-status.enum';

export interface SwapSessionDocument extends ISwapSession {
  _id?: string;
}

@Injectable()
export class SwapSessionMapper {
  toDomain(doc: SwapSessionDocument): SwapSession {
    const props: SwapSessionProps = {
      tradeOfferId: doc.tradeOfferId,
      initiatorId: doc.initiatorId,
      receiverId: doc.receiverId,
      shipmentMode: doc.shipmentMode ?? 'STANDARD',
      collateralAmount: Number(doc.collateralAmount) || 0,
      collateralCurrency: doc.collateralCurrency ?? 'TRY',
      collateralStatus: (doc.collateralStatus as (typeof CollateralStatus)[number]) ?? 'NONE',
      collateralLockedAt: doc.collateralLockedAt ?? undefined,
      collateralReleasedAt: doc.collateralReleasedAt ?? undefined,
      fromCollateralHoldId: doc.fromCollateralHoldId ?? undefined,
      toCollateralHoldId: doc.toCollateralHoldId ?? undefined,
      // ─── Komisyon alanları (yazım targeted updateOne ile yapılır; mapper yalnızca okur) ───
      offeredValue: doc.offeredValue !== undefined ? Number(doc.offeredValue) : undefined,
      requestedValue: doc.requestedValue !== undefined ? Number(doc.requestedValue) : undefined,
      cashAmount: doc.cashAmount !== undefined ? Number(doc.cashAmount) : undefined,
      cashDirection: doc.cashDirection ?? undefined,
      fromCommissionAmount: doc.fromCommissionAmount !== undefined ? Number(doc.fromCommissionAmount) : undefined,
      toCommissionAmount: doc.toCommissionAmount !== undefined ? Number(doc.toCommissionAmount) : undefined,
      fromXpCommission: doc.fromXpCommission !== undefined ? Number(doc.fromXpCommission) : undefined,
      toXpCommission: doc.toXpCommission !== undefined ? Number(doc.toXpCommission) : undefined,
      fromCommissionHoldId: doc.fromCommissionHoldId ?? undefined,
      toCommissionHoldId: doc.toCommissionHoldId ?? undefined,
      commissionStatus: doc.commissionStatus ?? undefined,
      commissionRateType: doc.commissionRateType ?? undefined,
      status: doc.status as SwapSessionStatus,
      timeoutAt: doc.timeoutAt,
      completedAt: doc.completedAt ?? undefined,
      cancelledAt: doc.cancelledAt ?? undefined,
      disputedAt: doc.disputedAt ?? undefined,
      parts: [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
    return SwapSession.createFrom(props, doc.id);
  }

  toPersistence(domain: SwapSession): Record<string, unknown> {
    const props = domain.getProps();
    return {
      _id: domain.id,
      id: domain.id,
      tradeOfferId: props.tradeOfferId,
      initiatorId: props.initiatorId,
      receiverId: props.receiverId,
      status: props.status,
      collateralAmount: Types.Decimal128.fromString(String(props.collateralAmount)),
      collateralCurrency: props.collateralCurrency,
      collateralStatus: props.collateralStatus,
      collateralLockedAt: props.collateralLockedAt,
      fromCollateralHoldId: props.fromCollateralHoldId,
      toCollateralHoldId: props.toCollateralHoldId,
      shipmentMode: props.shipmentMode,
      timeoutAt: props.timeoutAt,
      completedAt: props.completedAt,
      cancelledAt: props.cancelledAt,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}