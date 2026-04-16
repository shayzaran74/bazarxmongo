// apps/backend/src/modules/barter/domain/entities/trade-offer-item.entity.ts

import { Entity } from '@barterborsa/shared-core';
import { Prisma } from '@prisma/client';

export interface TradeOfferItemProps {
  listingId?: string;
  surplusItemId?: string;
  quantity: Prisma.Decimal;
  estimatedValue: Prisma.Decimal;
}

export class TradeOfferItem extends Entity<TradeOfferItemProps> {
  private constructor(props: TradeOfferItemProps, id?: string) {
    super(props, id);
  }

  public static create(
    quantity: Prisma.Decimal,
    estimatedValue: Prisma.Decimal,
    listingId?: string,
    surplusItemId?: string
  ): TradeOfferItem {
    if (!listingId && !surplusItemId) {
      throw new Error('Either listingId or surplusItemId must be provided');
    }

    return new TradeOfferItem({
      listingId,
      surplusItemId,
      quantity,
      estimatedValue,
    });
  }
}
