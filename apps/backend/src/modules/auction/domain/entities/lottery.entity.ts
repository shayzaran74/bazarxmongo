// apps/backend/src/modules/auction/domain/entities/lottery.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';
import { LotteryStatus } from '../enums/lottery-status.enum';
import * as crypto from 'crypto';

export interface LotteryProps {
  title: string;
  prizeDescription?: string;
  imageUrl?: string;
  ticketPrice: number;
  status: LotteryStatus;
  winnerId?: string;
  endTime: Date;
  maxTicketsPerUser: number;
  ownerId: string;
  startTime: Date;
  ticketDigits: number;
  totalTickets: number;
  numbersPerTicket: number;
  prizeValue?: number;
  winningNumber?: string;
  listingId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Lottery extends AggregateRoot<LotteryProps> {
  private constructor(props: LotteryProps, id?: string) {
    super(props, id);
  }

  public static create(
    title: string,
    ticketPrice: number,
    endTime: Date,
    ownerId: string,
    totalTickets: number = 100,
    maxTicketsPerUser: number = 10,
    listingId?: string
  ): Lottery {
    const now = new Date();
    return new Lottery({
      title,
      ticketPrice,
      endTime,
      ownerId,
      totalTickets,
      maxTicketsPerUser,
      listingId,
      status: LotteryStatus.ACTIVE,
      startTime: now,
      ticketDigits: totalTickets.toString().length,
      numbersPerTicket: 1,
      createdAt: now,
      updatedAt: now,
    });
  }

  public draw(): string {
    if (this.props.status !== LotteryStatus.ACTIVE) {
      throw new Error('Yalnızca aktif çekilişler çekilebilir');
    }

    const maxVal = this.props.totalTickets;
    const winningInt = crypto.randomInt(0, maxVal);
    const winningNumber = winningInt.toString().padStart(this.props.ticketDigits, '0');

    this.props.winningNumber = winningNumber;
    this.props.status = LotteryStatus.DRAWN;
    this.props.updatedAt = new Date();

    return winningNumber;
  }

  public drawManual(winningNumber: string, winnerId: string): void {
    if (this.props.status !== LotteryStatus.ACTIVE) {
      throw new Error('Yalnızca aktif çekilişler çekilebilir');
    }
    this.props.winningNumber = winningNumber;
    this.props.winnerId = winnerId;
    this.props.status = LotteryStatus.DRAWN;
    this.props.updatedAt = new Date();
  }

  public setWinner(userId: string): void {
    this.props.winnerId = userId;
    this.props.updatedAt = new Date();
  }

  public static createFrom(props: LotteryProps, id: string): Lottery {
    return new Lottery(props, id);
  }

  public updateProps(partial: Partial<Pick<LotteryProps,
    'title' | 'prizeDescription' | 'ticketPrice' | 'totalTickets' |
    'maxTicketsPerUser' | 'startTime' | 'endTime' | 'status' | 'prizeValue' | 'imageUrl'
  >>): void {
    if (partial.title !== undefined) this.props.title = partial.title;
    if (partial.prizeDescription !== undefined) this.props.prizeDescription = partial.prizeDescription;
    if (partial.ticketPrice !== undefined) this.props.ticketPrice = partial.ticketPrice;
    if (partial.totalTickets !== undefined) this.props.totalTickets = partial.totalTickets;
    if (partial.maxTicketsPerUser !== undefined) this.props.maxTicketsPerUser = partial.maxTicketsPerUser;
    if (partial.startTime !== undefined) this.props.startTime = partial.startTime;
    if (partial.endTime !== undefined) this.props.endTime = partial.endTime;
    if (partial.status !== undefined) this.props.status = partial.status;
    if (partial.prizeValue !== undefined) this.props.prizeValue = partial.prizeValue;
    if (partial.imageUrl !== undefined) this.props.imageUrl = partial.imageUrl;
    this.props.updatedAt = new Date();
  }
}