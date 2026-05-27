// apps/backend/src/modules/barter/domain/services/trade-state-machine.service.ts

import { Injectable } from '@nestjs/common';
import { TradeOfferStatus } from '../enums/trade-offer-status.enum';
import { DomainException } from '@barterborsa/shared-core';

@Injectable()
export class TradeStateMachineService {
  private readonly transitions: Record<TradeOfferStatus, TradeOfferStatus[]> = {
    [TradeOfferStatus.PENDING]: [
      TradeOfferStatus.ACCEPTED,
      TradeOfferStatus.REJECTED,
      TradeOfferStatus.COUNTER_OFFERED,
      TradeOfferStatus.EXPIRED,
      TradeOfferStatus.CANCELLED,
    ],
    [TradeOfferStatus.COUNTER_OFFERED]: [
      TradeOfferStatus.ACCEPTED,
      TradeOfferStatus.REJECTED,
      TradeOfferStatus.COUNTER_OFFERED,
      TradeOfferStatus.EXPIRED,
      TradeOfferStatus.CANCELLED,
    ],
    [TradeOfferStatus.ACCEPTED]: [TradeOfferStatus.LEGAL_PENDING, TradeOfferStatus.CANCELLED],
    [TradeOfferStatus.LEGAL_PENDING]: [TradeOfferStatus.COMPLETED, TradeOfferStatus.CANCELLED],
    [TradeOfferStatus.COMPLETED]: [],
    [TradeOfferStatus.REJECTED]: [],
    [TradeOfferStatus.EXPIRED]: [],
    [TradeOfferStatus.CANCELLED]: [],
  };

  public validateTransition(current: TradeOfferStatus, next: TradeOfferStatus): void {
    const allowed = this.transitions[current];
    if (!allowed || !allowed.includes(next)) {
      throw new DomainException(`Invalid trade offer transition from ${current} to ${next}`);
    }
  }
}
