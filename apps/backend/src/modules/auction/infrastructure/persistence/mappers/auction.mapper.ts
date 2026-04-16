// apps/backend/src/modules/auction/infrastructure/persistence/mappers/auction.mapper.ts

import { Injectable } from '@nestjs/common';
import { Auction } from '../../../domain/entities/auction.entity';
import { AuctionStatus } from '../../../domain/enums/auction-status.enum';

@Injectable()
export class AuctionMapper {
  toDomain(raw: any): Auction {
    return (Auction as any).createFrom({
      ...raw,
      status: raw.status as AuctionStatus,
    }, raw.id);
  }

  toPersistence(domain: Auction): any {
    const props = domain.getProps();
    return {
      id: domain.id,
      listingId: props.listingId,
      userId: props.userId,
      startingPrice: props.startingPrice,
      currentPrice: props.currentPrice,
      minBidIncrement: props.minBidIncrement,
      participationDeposit: props.participationDeposit,
      startTime: props.startTime,
      endTime: props.endTime,
      status: props.status,
      winnerId: props.winnerId,
      winner2Id: props.winner2Id,
      winner3Id: props.winner3Id,
      currentWinnerStep: props.currentWinnerStep,
      paymentDeadline: props.paymentDeadline,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
