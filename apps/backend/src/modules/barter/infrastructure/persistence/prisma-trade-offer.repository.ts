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

    await this.prisma.tradeOffer.upsert({
      where: { id: offer.id },
      // Sadece durum ve tarih alanları güncellenir; ilişkili öğeler değişmez
      update: {
        status: data.status as any,
        acceptedAt: data.acceptedAt as Date | undefined,
        rejectedAt: data.rejectedAt as Date | undefined,
        cancelledAt: data.cancelledAt as Date | undefined,
        completedAt: data.completedAt as Date | undefined,
      },
      create: {
        id: data.id as string,
        fromCompanyId: data.fromCompanyId as string,
        toCompanyId: data.toCompanyId as string,
        message: data.message as string | undefined,
        status: data.status as any,
        cashAmount: data.cashAmount as string,
        cashDirection: data.cashDirection as string,
        cashCurrency: data.cashCurrency as string,
        expiresAt: data.expiresAt as Date,
        initiatorId: data.initiatorId as string,
        initiatorType: data.initiatorType as string,
        receiverId: data.receiverId as string,
        receiverType: data.receiverType as string,
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
