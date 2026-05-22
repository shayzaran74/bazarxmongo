// apps/backend/src/modules/auction/domain/repositories/lottery.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { Lottery } from '../entities/lottery.entity';

export interface ILotteryTicket {
  id: string;
  lotteryId: string;
  userId: string;
  numbers: string[];
  createdAt: Date;
}

export interface ILotteryRepository extends IRepository<Lottery> {
  findById(id: string, session?: any): Promise<Lottery | null>;
  findAll(): Promise<Lottery[]>;
  save(lottery: Lottery): Promise<void>;
  delete(id: string): Promise<void>;
  findByOwnerId(ownerId: string): Promise<Lottery[]>;
  findActive(): Promise<Lottery[]>;
  findTickets(lotteryId: string): Promise<ILotteryTicket[]>;
  findWithFilters(filter: Record<string, unknown>, skip: number, take: number): Promise<{ items: Lottery[]; total: number }>;
  updateStatus(id: string, status: string): Promise<void>;
  createTicket(ticket: { lotteryId: string; userId: string; numbers: string[] }, session?: any): Promise<ILotteryTicket>;
  countTickets(lotteryId: string, userId?: string, session?: any): Promise<number>;
  findTicketWithNumbers(lotteryId: string, numbers: string[], session?: any): Promise<ILotteryTicket | null>;
  findExpiredActive(): Promise<{ id: string; title: string }[]>;
  findTicketsByUserId(userId: string): Promise<ILotteryTicket[]>;
}
