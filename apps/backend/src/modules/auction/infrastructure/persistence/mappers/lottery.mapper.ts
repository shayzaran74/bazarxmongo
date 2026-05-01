// apps/backend/src/modules/auction/infrastructure/persistence/mappers/lottery.mapper.ts

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Lottery, LotteryProps } from '../../../domain/entities/lottery.entity';
import { LotteryStatus } from '../../../domain/enums/lottery-status.enum';

type LotteryRaw = Prisma.LotteryGetPayload<object>;

@Injectable()
export class LotteryMapper {
  toDomain(raw: LotteryRaw): Lottery {
    const props: LotteryProps = {
      title: raw.title,
      prizeDescription: raw.prizeDescription ?? undefined,
      ticketPrice: raw.ticketPrice,
      status: raw.status as LotteryStatus,
      winnerId: raw.winnerId ?? undefined,
      endTime: raw.endTime,
      maxTicketsPerUser: raw.maxTicketsPerUser,
      ownerId: raw.ownerId,
      startTime: raw.startTime,
      ticketDigits: raw.ticketDigits,
      totalTickets: raw.totalTickets,
      numbersPerTicket: raw.numbersPerTicket,
      prizeValue: raw.prizeValue ?? undefined,
      winningNumber: raw.winningNumber ?? undefined,
      listingId: raw.listingId ?? undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
    return Lottery.createFrom(props, raw.id);
  }

  toPersistence(domain: Lottery): Record<string, unknown> {
    const props = domain.getProps();
    return {
      id: domain.id,
      title: props.title,
      prizeDescription: props.prizeDescription,
      ticketPrice: props.ticketPrice,
      status: props.status,
      winnerId: props.winnerId,
      endTime: props.endTime,
      maxTicketsPerUser: props.maxTicketsPerUser,
      ownerId: props.ownerId,
      startTime: props.startTime,
      ticketDigits: props.ticketDigits,
      totalTickets: props.totalTickets,
      numbersPerTicket: props.numbersPerTicket,
      prizeValue: props.prizeValue,
      winningNumber: props.winningNumber,
      listingId: props.listingId,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
