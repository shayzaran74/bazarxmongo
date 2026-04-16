// apps/backend/src/modules/auction/infrastructure/persistence/prisma-lottery.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ILotteryRepository } from '../../domain/repositories/lottery.repository.interface';
import { Lottery } from '../../domain/entities/lottery.entity';
import { LotteryMapper } from './mappers/lottery.mapper';

@Injectable()
export class PrismaLotteryRepository implements ILotteryRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: LotteryMapper
  ) {}

  async findById(id: string): Promise<Lottery | null> {
    const raw = await this.prisma.lottery.findUnique({
      where: { id },
    });
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findAll(): Promise<Lottery[]> {
    const raws = await this.prisma.lottery.findMany();
    return raws.map(raw => this.mapper.toDomain(raw));
  }

  async save(lottery: Lottery): Promise<void> {
    const data = this.mapper.toPersistence(lottery);
    await this.prisma.lottery.upsert({
      where: { id: lottery.id },
      update: data,
      create: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.lottery.delete({
      where: { id },
    });
  }
}
