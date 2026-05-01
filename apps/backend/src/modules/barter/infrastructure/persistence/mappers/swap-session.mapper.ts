// apps/backend/src/modules/barter/infrastructure/persistence/mappers/swap-session.mapper.ts

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SwapSession, SwapSessionProps } from '../../../domain/entities/swap-session.entity';
import { SwapSessionStatus } from '../../../domain/enums/swap-session-status.enum';

type SwapSessionRaw = Prisma.SwapSessionGetPayload<object>;

@Injectable()
export class SwapSessionMapper {
  toDomain(raw: SwapSessionRaw): SwapSession {
    const props: SwapSessionProps = {
      tradeOfferId: raw.tradeOfferId,
      initiatorId: raw.initiatorId,
      receiverId: raw.receiverId,
      shipmentMode: raw.shipmentMode,
      collateralAmount: raw.collateralAmount,
      collateralCurrency: raw.collateralCurrency,
      collateralStatus: raw.collateralStatus,
      collateralLockedAt: raw.collateralLockedAt ?? undefined,
      collateralReleasedAt: raw.collateralReleasedAt ?? undefined,
      fromCollateralHoldId: raw.fromCollateralHoldId ?? undefined,
      toCollateralHoldId: raw.toCollateralHoldId ?? undefined,
      status: raw.status as SwapSessionStatus,
      timeoutAt: raw.timeoutAt,
      completedAt: raw.completedAt ?? undefined,
      cancelledAt: raw.cancelledAt ?? undefined,
      disputedAt: raw.disputedAt ?? undefined,
      parts: [],
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
    return SwapSession.createFrom(props, raw.id);
  }

  toPersistence(domain: SwapSession): Record<string, unknown> {
    const props = domain.getProps();
    return {
      id: domain.id,
      tradeOfferId: props.tradeOfferId,
      initiatorId: props.initiatorId,
      receiverId: props.receiverId,
      status: props.status,
      collateralAmount: props.collateralAmount,
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
