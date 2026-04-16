// apps/backend/src/modules/auction/infrastructure/persistence/mappers/lottery.mapper.ts

import { Injectable } from '@nestjs/common';
import { Lottery } from '../../../domain/entities/lottery.entity';
import { LotteryStatus } from '../../../domain/enums/lottery-status.enum';

@Injectable()
export class LotteryMapper {
  toDomain(raw: any): Lottery {
    return (Lottery as any).createFrom({
      ...raw,
      status: raw.status as LotteryStatus,
    }, raw.id);
  }

  toPersistence(domain: Lottery): any {
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
