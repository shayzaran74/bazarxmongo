// apps/backend/src/modules/barter/infrastructure/persistence/prisma-trade-offer.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ITradeOfferRepository } from '../../domain/repositories/trade-offer.repository.interface';
import { TradeOffer } from '../../domain/entities/trade-offer.entity';
import { TradeOfferMapper } from './mappers/trade-offer.mapper';

@Injectable()
export class PrismaTradeOfferRepository implements ITradeOfferRepository {
  constructor(
     private readonly prisma: PrismaService,
     private readonly mapper: TradeOfferMapper
  ) {}

  async findById(id: string): Promise<TradeOffer | null> {
    const raw = await this.prisma.tradeOffer.findUnique({
      where: { id },
      include: {
        offeredItems: true,
        requestedItems: true,
      },
    });
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findAll(): Promise<TradeOffer[]> {
    const raws = await this.prisma.tradeOffer.findMany({
      include: {
        offeredItems: true,
        requestedItems: true,
      },
    });
    return raws.map(raw => this.mapper.toDomain(raw));
  }

  async save(offer: TradeOffer): Promise<void> {
    const data = this.mapper.toPersistence(offer);
    const { offeredItems, requestedItems, ...offerData } = data;

    await this.prisma.tradeOffer.upsert({
      where: { id: offer.id },
      update: {
        ...offerData as any,
      },
      create: {
        ...offerData as any,
        offeredItems: {
          create: offeredItems,
        },
        requestedItems: {
          create: requestedItems,
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tradeOffer.delete({
      where: { id },
    });
  }

  async listByCompany(companyId: string): Promise<TradeOffer[]> {
    const raws = await this.prisma.tradeOffer.findMany({
      where: {
        OR: [{ fromCompanyId: companyId }, { toCompanyId: companyId }],
      },
      include: {
        offeredItems: true,
        requestedItems: true,
      },
    });
    return raws.map(raw => this.mapper.toDomain(raw));
  }
}
