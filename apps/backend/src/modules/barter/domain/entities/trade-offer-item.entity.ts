// apps/backend/src/modules/barter/domain/entities/trade-offer-item.entity.ts

import { Entity } from '@barterborsa/shared-core';

export interface TradeOfferItemProps {
  listingId?: string;
  surplusItemId?: string;
  quantity: number;
  estimatedValue: number;
}

export class TradeOfferItem extends Entity<TradeOfferItemProps> {
  private constructor(props: TradeOfferItemProps, id?: string) {
    super(props, id);
  }

  public static create(
    quantity: number,
    estimatedValue: number,
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
