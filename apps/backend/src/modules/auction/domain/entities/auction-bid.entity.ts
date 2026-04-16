// apps/backend/src/modules/auction/domain/entities/auction-bid.entity.ts

import { Entity } from '@barterborsa/shared-core';
import { Prisma } from '@prisma/client';

export interface AuctionBidProps {
  auctionId: string;
  userId: string;
  amount: Prisma.Decimal;
  createdAt: Date;
}

export class AuctionBid extends Entity<AuctionBidProps> {
  private constructor(props: AuctionBidProps, id?: string) {
    super(props, id);
  }

  public static create(auctionId: string, userId: string, amount: Prisma.Decimal): AuctionBid {
    return new AuctionBid({
      auctionId,
      userId,
      amount,
      createdAt: new Date(),
    });
  }
}
