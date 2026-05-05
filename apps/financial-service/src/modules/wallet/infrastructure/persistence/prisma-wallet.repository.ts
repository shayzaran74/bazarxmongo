// apps/financial-service/src/modules/wallet/infrastructure/persistence/prisma-wallet.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { IWalletRepository } from '../../domain/repositories/wallet.repository.interface';
import { Wallet } from '../../domain/entities/wallet.entity';
import { WalletMapper } from './mappers/wallet.mapper';

@Injectable()
export class PrismaWalletRepository implements IWalletRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: WalletMapper,
  ) {}

  async findByUserId(userId: string): Promise<Wallet | null> {
    const raw = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findById(id: string): Promise<Wallet | null> {
    const raw = await this.prisma.wallet.findUnique({
      where: { id },
    });
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findAll(): Promise<Wallet[]> {
    const raws = await this.prisma.wallet.findMany();
    return raws.map(raw => this.mapper.toDomain(raw));
  }

  async save(entity: Wallet): Promise<void> {
    const persistence = this.mapper.toPersistence(entity);
    
    await this.prisma.$transaction(async (tx) => {
      const current = await tx.wallet.findUnique({
        where: { userId: entity.userId },
      });

      if (!current) {
        // Cüzdan yoksa yeni oluştur (upsert mantığının 'create' kısmı)
        await tx.wallet.create({ data: persistence });
        return;
      }

      // Atomik güncellemeler için farkları hesapla
      // Decimal değerler için parseFloat veya Number kullanımı (Prisma Decimal tipiyle uyumlu)
      const diffTL = Number(persistence.balanceTL) - Number(current.balanceTL);
      const diffBarter = Number(persistence.barterBalance) - Number(current.barterBalance);
      const diffXpPoints = persistence.xpPoints - current.xpPoints;
      const diffXpAds = Number(persistence.xpAdsBalance) - Number(current.xpAdsBalance);
      const diffXpTrade = Number(persistence.xpTradeBalance) - Number(current.xpTradeBalance);
      const diffXpComm = Number(persistence.xpCommissionBalance) - Number(current.xpCommissionBalance);

      await tx.wallet.update({
        where: { userId: entity.userId },
        data: {
          balanceTL: { increment: diffTL },
          barterBalance: { increment: diffBarter },
          xpPoints: { increment: diffXpPoints },
          xpAdsBalance: { increment: diffXpAds },
          xpTradeBalance: { increment: diffXpTrade },
          xpCommissionBalance: { increment: diffXpComm },
          lastXpAdsEarnedDate: persistence.lastXpAdsEarnedDate,
        },
      });
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.wallet.delete({ where: { id } });
  }
}
