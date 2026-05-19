// apps/backend/src/modules/barter/infrastructure/persistence/mappers/trade-offer.mapper.ts
// TradeOfferMapper — Prisma → Mongoose (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { ITradeOffer } from '@barterborsa/shared-persistence/schemas/backend/tradeOffer.schema';
import { TradeOffer, TradeOfferProps } from '../../../domain/entities/trade-offer.entity';
import { TradeOfferItem } from '../../../domain/entities/trade-offer-item.entity';
import { TradeOfferStatus } from '../../../domain/enums/trade-offer-status.enum';

export interface TradeOfferDocument extends ITradeOffer {
  _id?: string;
  offeredItems?: any[];
  requestedItems?: any[];
}

@Injectable()
export class TradeOfferMapper {
  toDomain(doc: TradeOfferDocument): TradeOffer {
    const mapItem = (item: any): TradeOfferItem =>
      TradeOfferItem.create(
        Number(item.quantity) || 0,
        Number(item.estimatedValue) || 0,
        item.listingId ?? undefined,
        item.surplusItemId ?? undefined,
      );

    const props: TradeOfferProps = {
      fromCompanyId: doc.fromCompanyId ?? '',
      toCompanyId: doc.toCompanyId ?? '',
      message: doc.message ?? undefined,
      status: doc.status as TradeOfferStatus,
      parentOfferId: doc.parentOfferId ?? undefined,
      cashAmount: Number(doc.cashAmount) || 0,
      cashDirection: (doc.cashDirection === 'BOTH' ? 'BOTH' : doc.cashDirection === ' initiator_to_receiver' ? 'TO_INITIATOR' : 'TO_RECEIVER') as 'TO_INITIATOR' | 'TO_RECEIVER',
      cashCurrency: doc.cashCurrency ?? 'TRY',
      expiresAt: doc.expiresAt,
      initiatorId: doc.initiatorId ?? '',
      initiatorType: 'COMPANY',
      receiverId: doc.receiverId ?? '',
      receiverType: 'COMPANY',
      acceptedAt: doc.acceptedAt ?? undefined,
      rejectedAt: doc.rejectedAt ?? undefined,
      cancelledAt: doc.cancelledAt ?? undefined,
      completedAt: doc.completedAt ?? undefined,
      offeredItems: (doc.offeredItems ?? []).map(mapItem),
      requestedItems: (doc.requestedItems ?? []).map(mapItem),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    return TradeOffer.createFrom(props, doc.id);
  }

  toPersistence(domain: TradeOffer): Record<string, unknown> {
    const props = domain.getProps();
    return {
      _id: domain.id,
      id: domain.id,
      fromCompanyId: props.fromCompanyId,
      toCompanyId: props.toCompanyId,
      message: props.message,
      status: props.status,
      cashAmount: Types.Decimal128.fromString(String(props.cashAmount)),
      cashDirection: props.cashDirection,
      cashCurrency: props.cashCurrency,
      expiresAt: props.expiresAt,
      initiatorId: props.initiatorId,
      initiatorType: props.initiatorType,
      receiverId: props.receiverId,
      receiverType: props.receiverType,
    };
  }
}