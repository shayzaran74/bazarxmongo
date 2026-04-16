// apps/backend/src/modules/barter/infrastructure/persistence/mappers/trade-offer.mapper.ts

import { Injectable } from '@nestjs/common';
import { TradeOffer } from '../../../domain/entities/trade-offer.entity';
import { TradeOfferItem } from '../../../domain/entities/trade-offer-item.entity';
import { TradeOfferStatus } from '../../../domain/enums/trade-offer-status.enum';

@Injectable()
export class TradeOfferMapper {
  toDomain(raw: any): TradeOffer {
    const offeredItems = (raw.offeredItems || []).map((item: any) =>
      TradeOfferItem.create(item.quantity, item.estimatedValue, item.listingId, item.surplusItemId)
    );
    const requestedItems = (raw.requestedItems || []).map((item: any) =>
      TradeOfferItem.create(item.quantity, item.estimatedValue, item.listingId, item.surplusItemId)
    );

    const offer = (TradeOffer as any).createFrom({
      ...raw,
      status: raw.status as TradeOfferStatus,
      offeredItems,
      requestedItems,
    }, raw.id);

    return offer;
  }

  toPersistence(domain: TradeOffer): any {
    const props = domain.getProps();
    return {
      id: domain.id,
      fromCompanyId: props.fromCompanyId,
      toCompanyId: props.toCompanyId,
      message: props.message,
      status: props.status,
      cashAmount: props.cashAmount,
      cashDirection: props.cashDirection,
      cashCurrency: props.cashCurrency,
      expiresAt: props.expiresAt,
      initiatorId: props.initiatorId,
      initiatorType: props.initiatorType,
      receiverId: props.receiverId,
      receiverType: props.receiverType,
      offeredItems: props.offeredItems.map(item => ({
        listingId: item.getProps().listingId,
        surplusItemId: item.getProps().surplusItemId,
        quantity: item.getProps().quantity,
        estimatedValue: item.getProps().estimatedValue,
      })),
      requestedItems: props.requestedItems.map(item => ({
        listingId: item.getProps().listingId,
        surplusItemId: item.getProps().surplusItemId,
        quantity: item.getProps().quantity,
        estimatedValue: item.getProps().estimatedValue,
      })),
    };
  }
}
