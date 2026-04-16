// apps/backend/src/modules/barter/infrastructure/persistence/prisma-swap-session.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ISwapSessionRepository } from '../../domain/repositories/swap-session.repository.interface';
import { SwapSession } from '../../domain/entities/swap-session.entity';
import { SwapSessionMapper } from './mappers/swap-session.mapper';

@Injectable()
export class PrismaSwapSessionRepository implements ISwapSessionRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: SwapSessionMapper
  ) {}

  async findById(id: string): Promise<SwapSession | null> {
    const raw = await this.prisma.swapSession.findUnique({
      where: { id },
    });
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findByTradeOfferId(tradeOfferId: string): Promise<SwapSession | null> {
    const raw = await this.prisma.swapSession.findUnique({
      where: { tradeOfferId },
    });
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findAll(): Promise<SwapSession[]> {
    const raws = await this.prisma.swapSession.findMany();
    return raws.map(raw => this.mapper.toDomain(raw));
  }

  async save(session: SwapSession): Promise<void> {
    const data = this.mapper.toPersistence(session);
    await this.prisma.swapSession.upsert({
      where: { id: session.id },
      update: data,
      create: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.swapSession.delete({
      where: { id },
    });
  }
}
