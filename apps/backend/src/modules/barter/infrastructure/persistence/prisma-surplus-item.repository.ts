// apps/backend/src/modules/barter/infrastructure/persistence/prisma-surplus-item.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ISurplusItemRepository } from '../../domain/repositories/surplus-item.repository.interface';
import { SurplusItem } from '../../domain/entities/surplus-item.entity';
import { SurplusItemMapper } from './mappers/surplus-item.mapper';

@Injectable()
export class PrismaSurplusItemRepository implements ISurplusItemRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: SurplusItemMapper
  ) {}

  async findById(id: string): Promise<SurplusItem | null> {
    const raw = await this.prisma.surplusItem.findUnique({ where: { id } });
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findAll(): Promise<SurplusItem[]> {
    const raws = await this.prisma.surplusItem.findMany();
    return raws.map(raw => this.mapper.toDomain(raw));
  }

  async save(item: SurplusItem): Promise<void> {
    const data = this.mapper.toPersistence(item);
    await this.prisma.surplusItem.upsert({
      where: { id: item.id },
      update: data,
      create: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.surplusItem.delete({ where: { id } });
  }
}
