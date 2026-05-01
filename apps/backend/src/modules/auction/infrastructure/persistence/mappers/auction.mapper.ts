// apps/backend/src/modules/auction/infrastructure/persistence/mappers/auction.mapper.ts

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Auction, AuctionProps } from '../../../domain/entities/auction.entity';
import { AuctionStatus } from '../../../domain/enums/auction-status.enum';

type AuctionRaw = Prisma.AuctionGetPayload<object>;

@Injectable()
export class AuctionMapper {
  toDomain(raw: AuctionRaw): Auction {
    const props: AuctionProps = {
      listingId: raw.listingId,
      userId: raw.userId,
      startingPrice: raw.startingPrice,
      currentPrice: raw.currentPrice,
      minBidIncrement: raw.minBidIncrement,
      participationDeposit: raw.participationDeposit ?? undefined,
      startTime: raw.startTime,
      endTime: raw.endTime,
      status: raw.status as AuctionStatus,
      winnerId: raw.winnerId ?? undefined,
      winner2Id: raw.winner2Id ?? undefined,
      winner3Id: raw.winner3Id ?? undefined,
      currentWinnerStep: raw.currentWinnerStep,
      paymentDeadline: raw.paymentDeadline ?? undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
    return Auction.createFrom(props, raw.id);
  }

  toPersistence(domain: Auction): Record<string, unknown> {
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
