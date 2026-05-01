// apps/backend/src/modules/auction/infrastructure/persistence/prisma-auction.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { IAuctionRepository } from '../../domain/repositories/auction.repository.interface';
import { Auction } from '../../domain/entities/auction.entity';
import { AuctionMapper } from './mappers/auction.mapper';

@Injectable()
export class PrismaAuctionRepository implements IAuctionRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: AuctionMapper
  ) {}

  async findById(id: string): Promise<Auction | null> {
    const raw = await this.prisma.auction.findUnique({
      where: { id },
    });
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findAll(): Promise<Auction[]> {
    const raws = await this.prisma.auction.findMany();
    return raws.map(raw => this.mapper.toDomain(raw));
  }

  async save(auction: Auction): Promise<void> {
    const data = this.mapper.toPersistence(auction);
    await this.prisma.auction.upsert({
      where: { id: auction.id },
      update: data as any,
      create: data as any,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.auction.delete({
      where: { id },
    });
  }
}
