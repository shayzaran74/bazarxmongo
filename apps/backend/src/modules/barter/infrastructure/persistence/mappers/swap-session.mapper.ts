// apps/backend/src/modules/barter/infrastructure/persistence/mappers/swap-session.mapper.ts

import { Injectable } from '@nestjs/common';
import { SwapSession } from '../../../domain/entities/swap-session.entity';
import { SwapSessionStatus } from '../../../domain/enums/swap-session-status.enum';

@Injectable()
export class SwapSessionMapper {
  toDomain(raw: any): SwapSession {
    return (SwapSession as any).createFrom({
      ...raw,
      status: raw.status as SwapSessionStatus,
    }, raw.id);
  }

  toPersistence(domain: SwapSession): any {
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
      shipmentMode: props.shipmentMode,
      timeoutAt: props.timeoutAt,
      completedAt: props.completedAt,
      cancelledAt: props.cancelledAt,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
