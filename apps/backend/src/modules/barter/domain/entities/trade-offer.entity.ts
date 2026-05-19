// apps/backend/src/modules/barter/domain/entities/trade-offer.entity.ts

import { AggregateRoot, DomainException } from '@barterborsa/shared-core';
import { TradeOfferStatus } from '../enums/trade-offer-status.enum';
import { TradeOfferItem } from './trade-offer-item.entity';

export interface TradeOfferProps {
  fromCompanyId: string;
  toCompanyId: string;
  offeredItemId?: string;
  requestedItemId?: string;
  message?: string;
  status: TradeOfferStatus;
  chainId?: string;
  parentOfferId?: string;
  cashAmount: number;
  cashDirection: 'TO_INITIATOR' | 'TO_RECEIVER';
  cashCurrency: string;
  expiresAt: Date;
  initiatorId: string;
  initiatorType: string;
  receiverId: string;
  receiverType: string;
  legalAcceptedAt?: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  cancelledAt?: Date;
  completedAt?: Date;
  offeredItems: TradeOfferItem[];
  requestedItems: TradeOfferItem[];
  createdAt: Date;
  updatedAt: Date;
}

export class TradeOffer extends AggregateRoot<TradeOfferProps> {
  private constructor(props: TradeOfferProps, id?: string) {
    super(props, id);
  }

  public static create(
    fromCompanyId: string,
    toCompanyId: string,
    offeredItems: TradeOfferItem[],
    requestedItems: TradeOfferItem[],
    cashAmount: number = 0,
    cashDirection: 'TO_INITIATOR' | 'TO_RECEIVER' = 'TO_RECEIVER',
    expiresInDays: number = 7,
    message?: string,
    parentOfferId?: string
  ): TradeOffer {
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(now.getDate() + expiresInDays);

    return new TradeOffer({
      fromCompanyId,
      toCompanyId,
      message,
      status: TradeOfferStatus.PENDING,
      parentOfferId,
      cashAmount,
      cashDirection,
      cashCurrency: 'TRY',
      expiresAt,
      initiatorId: fromCompanyId, // Simplified for now
      initiatorType: 'COMPANY',
      receiverId: toCompanyId,
      receiverType: 'COMPANY',
      offeredItems,
      requestedItems,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Persistence'dan yeniden oluşturmak için (domain doğrulaması atlanır)
  public static createFrom(props: TradeOfferProps, id: string): TradeOffer {
    return new TradeOffer(props, id);
  }

  get status(): TradeOfferStatus {
    return this.props.status;
  }

  public accept(): void {
    if (this.props.status !== TradeOfferStatus.PENDING && this.props.status !== TradeOfferStatus.COUNTER_OFFERED) {
      throw new DomainException('Only pending or counter-offered offers can be accepted');
    }
    this.props.status = TradeOfferStatus.ACCEPTED;
    this.props.acceptedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public reject(): void {
    if (this.props.status !== TradeOfferStatus.PENDING && this.props.status !== TradeOfferStatus.COUNTER_OFFERED) {
      throw new DomainException('Only pending or counter-offered offers can be rejected');
    }
    this.props.status = TradeOfferStatus.REJECTED;
    this.props.rejectedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public counter(): void {
     this.props.status = TradeOfferStatus.COUNTER_OFFERED;
     this.props.updatedAt = new Date();
  }

  public complete(): void {
    this.props.status = TradeOfferStatus.COMPLETED;
    this.props.completedAt = new Date();
    this.props.updatedAt = new Date();
  }
}
