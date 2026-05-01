// apps/backend/src/modules/barter/infrastructure/persistence/mappers/trade-offer.mapper.ts

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TradeOffer, TradeOfferProps } from '../../../domain/entities/trade-offer.entity';
import { TradeOfferItem } from '../../../domain/entities/trade-offer-item.entity';
import { TradeOfferStatus } from '../../../domain/enums/trade-offer-status.enum';

type TradeOfferRaw = Prisma.TradeOfferGetPayload<{
  include: { offeredItems: true; requestedItems: true };
}>;

type TradeOfferItemRaw = {
  quantity: Prisma.Decimal;
  estimatedValue: Prisma.Decimal;
  listingId?: string | null;
  surplusItemId?: string | null;
};

@Injectable()
export class TradeOfferMapper {
  toDomain(raw: TradeOfferRaw): TradeOffer {
    const mapItem = (item: TradeOfferItemRaw): TradeOfferItem =>
      TradeOfferItem.create(
        item.quantity,
        item.estimatedValue,
        item.listingId ?? undefined,
        item.surplusItemId ?? undefined,
      );

    const props: TradeOfferProps = {
      fromCompanyId: raw.fromCompanyId ?? '',
      toCompanyId: raw.toCompanyId ?? '',
      message: raw.message ?? undefined,
      status: raw.status as TradeOfferStatus,
      parentOfferId: raw.parentOfferId ?? undefined,
      cashAmount: raw.cashAmount,
      cashDirection: (raw.cashDirection ?? 'TO_RECEIVER') as 'TO_INITIATOR' | 'TO_RECEIVER',
      cashCurrency: raw.cashCurrency ?? 'TRY',
      expiresAt: raw.expiresAt,
      initiatorId: raw.initiatorId ?? '',
      initiatorType: raw.initiatorType ?? 'COMPANY',
      receiverId: raw.receiverId ?? '',
      receiverType: raw.receiverType ?? 'COMPANY',
      acceptedAt: raw.acceptedAt ?? undefined,
      rejectedAt: raw.rejectedAt ?? undefined,
      cancelledAt: raw.cancelledAt ?? undefined,
      completedAt: raw.completedAt ?? undefined,
      offeredItems: (raw.offeredItems ?? []).map(mapItem),
      requestedItems: (raw.requestedItems ?? []).map(mapItem),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };

    return TradeOffer.createFrom(props, raw.id);
  }

  toPersistence(domain: TradeOffer): Record<string, unknown> {
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
    };
  }
}
