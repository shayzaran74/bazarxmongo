// apps/backend/src/modules/auction/infrastructure/persistence/mappers/lottery.mapper.ts
// LotteryMapper — Prisma → Mongoose (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { ILottery } from '@barterborsa/shared-persistence/schemas/backend/lottery.schema';
import { Lottery, LotteryProps } from '../../../domain/entities/lottery.entity';
import { LotteryStatus } from '../../../domain/enums/lottery-status.enum';

export interface LotteryDocument extends ILottery {
  _id?: string;
}

@Injectable()
export class LotteryMapper {
  toDomain(doc: LotteryDocument): Lottery {
    const props: LotteryProps = {
      title: doc.title,
      prizeDescription: doc.prizeDescription ?? undefined,
      ticketPrice: Number(doc.ticketPrice) || 0,
      status: (doc.status as LotteryStatus) || LotteryStatus.ACTIVE,
      winnerId: doc.winnerId ?? undefined,
      endTime: doc.endTime,
      maxTicketsPerUser: doc.maxTicketsPerUser ?? 10,
      ownerId: doc.ownerId,
      startTime: doc.startTime,
      ticketDigits: doc.ticketDigits ?? 3,
      totalTickets: doc.totalTickets ?? 100,
      numbersPerTicket: doc.numbersPerTicket ?? 1,
      prizeValue: doc.prizeValue ? Number(doc.prizeValue) : undefined,
      winningNumber: doc.winningNumber ?? undefined,
      listingId: doc.listingId ?? undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
    return Lottery.createFrom(props, doc.id);
  }

  toPersistence(domain: Lottery): Record<string, unknown> {
    const props = domain.getProps();
    return {
      _id: domain.id,
      id: domain.id,
      title: props.title,
      prizeDescription: props.prizeDescription,
      ticketPrice: Types.Decimal128.fromString(String(props.ticketPrice)),
      status: props.status,
      winnerId: props.winnerId,
      endTime: props.endTime,
      maxTicketsPerUser: props.maxTicketsPerUser,
      ownerId: props.ownerId,
      startTime: props.startTime,
      ticketDigits: props.ticketDigits,
      totalTickets: props.totalTickets,
      numbersPerTicket: props.numbersPerTicket,
      prizeValue: props.prizeValue != null ? Types.Decimal128.fromString(String(props.prizeValue)) : undefined,
      winningNumber: props.winningNumber,
      listingId: props.listingId,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}