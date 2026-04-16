// apps/backend/src/modules/auction/domain/entities/lottery.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';
import { Prisma } from '@prisma/client';
import { LotteryStatus } from '../enums/lottery-status.enum';
import * as crypto from 'crypto';

export interface LotteryProps {
  title: string;
  prizeDescription?: string;
  ticketPrice: Prisma.Decimal;
  status: LotteryStatus;
  winnerId?: string;
  endTime: Date;
  maxTicketsPerUser: number;
  ownerId: string;
  startTime: Date;
  ticketDigits: number;
  totalTickets: number;
  numbersPerTicket: number;
  prizeValue?: Prisma.Decimal;
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
    ticketPrice: Prisma.Decimal,
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
    if (this.props.status !== LotteryStatus.ACTIVE && new Date() < this.props.endTime) {
       // Optional: enforce end time before draw
    }

    // crypto.randomInt for fairness
    const maxVal = this.props.totalTickets;
    const winningInt = crypto.randomInt(0, maxVal);
    const winningNumber = winningInt.toString().padStart(this.props.ticketDigits, '0');
    
    this.props.winningNumber = winningNumber;
    this.props.status = LotteryStatus.DRAWN;
    this.props.updatedAt = new Date();

    return winningNumber;
  }
}
