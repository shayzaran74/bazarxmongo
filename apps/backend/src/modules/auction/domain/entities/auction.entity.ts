// apps/backend/src/modules/auction/domain/entities/auction.entity.ts

import { AggregateRoot, DomainException } from '@barterborsa/shared-core';
import { AuctionStatus } from '../enums/auction-status.enum';

export interface AuctionProps {
  listingId: string;
  userId: string; // Vendor who created the auction
  startingPrice: number;
  currentPrice: number;
  minBidIncrement: number;
  participationDeposit?: number;
  startTime: Date;
  endTime: Date;
  status: AuctionStatus;
  winnerId?: string;
  winner2Id?: string;
  winner3Id?: string;
  currentWinnerStep: number;
  paymentDeadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// State geçiş haritası
const VALID_TRANSITIONS: Record<AuctionStatus, AuctionStatus[]> = {
  [AuctionStatus.SCHEDULED]: [AuctionStatus.ACTIVE, AuctionStatus.CANCELLED],
  [AuctionStatus.ACTIVE]: [AuctionStatus.ENDED, AuctionStatus.CANCELLED],
  [AuctionStatus.ENDED]: [AuctionStatus.COMPLETED],
  [AuctionStatus.COMPLETED]: [],
  [AuctionStatus.CANCELLED]: [],
};

export class Auction extends AggregateRoot<AuctionProps> {
  private constructor(props: AuctionProps, id?: string) {
    super(props, id);
  }

  public static create(
    listingId: string,
    userId: string,
    startingPrice: number,
    startTime: Date,
    endTime: Date,
    minBidIncrement: number = 1,
    participationDeposit?: number
  ): Auction {
    const now = new Date();
    if (startTime >= endTime) {
      throw new DomainException('Start time must be before end time');
    }

    return new Auction({
      listingId,
      userId,
      startingPrice,
      currentPrice: startingPrice,
      minBidIncrement,
      participationDeposit,
      startTime,
      endTime,
      status: AuctionStatus.SCHEDULED,
      currentWinnerStep: 1,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Persistence'dan yeniden oluşturmak için (domain doğrulaması atlanır)
  public static createFrom(props: AuctionProps, id: string): Auction {
    return new Auction(props, id);
  }

  // Merkezi state geçiş metodu
  private transitionTo(newStatus: AuctionStatus): void {
    const current = this.props.status;
    const allowed = VALID_TRANSITIONS[current] || [];

    if (!allowed.includes(newStatus)) {
      throw new DomainException(
        `Invalid state transition: ${current} → ${newStatus}`,
      );
    }

    this.props.status = newStatus;
    this.props.updatedAt = new Date();
  }

  public start(): void {
    if (this.props.status !== AuctionStatus.SCHEDULED) {
      throw new DomainException('Only scheduled auctions can be started');
    }
    this.transitionTo(AuctionStatus.ACTIVE);
  }

  public placeBid(userId: string, amount: number): void {
    if (this.props.status !== AuctionStatus.ACTIVE) {
      throw new DomainException('Auction is not active');
    }

    const now = new Date();
    if (now > this.props.endTime) {
      throw new DomainException('Auction has ended');
    }

    const minRequired = this.props.currentPrice + this.props.minBidIncrement;
    if (amount < minRequired) {
      throw new DomainException(`Bid must be at least ${minRequired}`);
    }

    this.props.currentPrice = amount;
    this.props.updatedAt = new Date();
  }

  public end(): void {
    if (this.props.status !== AuctionStatus.ACTIVE) {
      throw new DomainException('Only active auctions can be ended');
    }
    this.transitionTo(AuctionStatus.ENDED);
  }

  public complete(): void {
    this.transitionTo(AuctionStatus.COMPLETED);
  }

  public cancel(): void {
    if (this.props.status === AuctionStatus.COMPLETED || this.props.status === AuctionStatus.ENDED) {
      throw new DomainException('Ended or completed auctions cannot be cancelled');
    }
    this.transitionTo(AuctionStatus.CANCELLED);
  }

  public updateProps(partial: Partial<Pick<AuctionProps,
    'startingPrice' | 'minBidIncrement' | 'participationDeposit' |
    'startTime' | 'endTime' | 'status'
  >>): void {
    if (partial.startingPrice !== undefined) this.props.startingPrice = partial.startingPrice;
    if (partial.minBidIncrement !== undefined) this.props.minBidIncrement = partial.minBidIncrement;
    if (partial.participationDeposit !== undefined) this.props.participationDeposit = partial.participationDeposit;
    if (partial.startTime !== undefined) this.props.startTime = partial.startTime;
    if (partial.endTime !== undefined) this.props.endTime = partial.endTime;
    if (partial.status !== undefined) this.props.status = partial.status;
    this.props.updatedAt = new Date();
  }
}
