// apps/backend/src/modules/auction/infrastructure/persistence/mappers/auction.mapper.ts
// AuctionMapper — Prisma → Mongoose (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { IAuction } from '@barterborsa/shared-persistence/schemas/backend/auction.schema';
import { Auction, AuctionProps } from '../../../domain/entities/auction.entity';
import { AuctionStatus } from '../../../domain/enums/auction-status.enum';

export interface AuctionDocument extends IAuction {
  _id?: string;
}

@Injectable()
export class AuctionMapper {
  toDomain(doc: AuctionDocument): Auction {
    const props: AuctionProps = {
      listingId: doc.listingId,
      userId: doc.userId,
      startingPrice: Number(doc.startingPrice) || 0,
      currentPrice: Number(doc.currentPrice) || 0,
      minBidIncrement: Number(doc.minBidIncrement) || 1,
      participationDeposit: doc.participationDeposit ? Number(doc.participationDeposit) : undefined,
      startTime: doc.startTime,
      endTime: doc.endTime,
      status: doc.status as AuctionStatus,
      winnerId: doc.winnerId ?? undefined,
      winner2Id: doc.winner2Id ?? undefined,
      winner3Id: doc.winner3Id ?? undefined,
      currentWinnerStep: doc.currentWinnerStep ?? 1,
      paymentDeadline: doc.paymentDeadline ?? undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
    const domain = Auction.createFrom(props, doc.id);
    (domain as any)._version = doc.version ?? 1;
    return domain;
  }

  toPersistence(domain: Auction): Record<string, unknown> {
    const props = domain.getProps();
    return {
      _id: domain.id,
      id: domain.id,
      listingId: props.listingId,
      userId: props.userId,
      startingPrice: Types.Decimal128.fromString(String(props.startingPrice)),
      currentPrice: Types.Decimal128.fromString(String(props.currentPrice)),
      minBidIncrement: Types.Decimal128.fromString(String(props.minBidIncrement)),
      participationDeposit: props.participationDeposit != null ? Types.Decimal128.fromString(String(props.participationDeposit)) : undefined,
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
      version: domain.version,
    };
  }
}