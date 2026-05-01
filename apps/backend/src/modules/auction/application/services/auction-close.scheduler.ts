// apps/backend/src/modules/auction/application/services/auction-close.scheduler.ts

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@barterborsa/shared-persistence';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { AuditLogService } from '../../../audit/application/audit-log.service';

// Süresi dolmuş açık artırma kontrolü — her 60 saniyede bir
const CHECK_INTERVAL_MS = 60_000;

// Prisma include tipi
type ExpiredAuction = Prisma.AuctionGetPayload<{
  include: {
    bids: { orderBy: { amount: 'desc' }; take: 1 };
    participations: true;
  };
}>;

@Injectable()
export class AuctionCloseScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AuctionCloseScheduler.name);
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly financialGateway: FinancialGatewayService,
    private readonly auditLog: AuditLogService,
  ) {}

  onModuleInit(): void {
    void this.closeExpiredAuctions();
    this.intervalHandle = setInterval(
      () => void this.closeExpiredAuctions(),
      CHECK_INTERVAL_MS,
    );
  }

  onModuleDestroy(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  async closeExpiredAuctions(): Promise<void> {
    const now = new Date();

    const expiredAuctions = await this.prisma.auction.findMany({
      where: { status: 'ACTIVE', endTime: { lte: now } },
      include: {
        bids: { orderBy: { amount: 'desc' }, take: 1 },
        participations: true,
      },
    });

    if (expiredAuctions.length === 0) return;

    this.logger.log(`Süresi dolmuş ${expiredAuctions.length} açık artırma kapatılıyor`);

    for (const auction of expiredAuctions) {
      try {
        await this.closeAuction(auction);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
        this.logger.error('Açık artırma kapatılamadı', { auctionId: auction.id, error: msg });
      }
    }
  }

  private async closeAuction(auction: ExpiredAuction): Promise<void> {
    // En yüksek teklifi veren kazanır; teklif yoksa kazanan yok
    const topBid = auction.bids[0] ?? null;
    const winnerId = topBid?.userId ?? null;

    // Kazanan + durum güncellemesini atomik işlem içinde yap
    await this.prisma.$transaction(async (tx) => {
      await tx.auction.update({
        where: { id: auction.id },
        data: { status: 'ENDED', winnerId },
      });

      if (winnerId && topBid) {
        await tx.auctionWinner.upsert({
          where: { auctionId_position: { auctionId: auction.id, position: 1 } },
          create: {
            auctionId: auction.id,
            userId: winnerId,
            position: 1,
            amount: topBid.amount,
          },
          update: {},
        });
      }

      // Katılımcı durumlarını toplu güncelle
      await tx.auctionParticipation.updateMany({
        where: { auctionId: auction.id, userId: winnerId ?? '__none__' },
        data: { status: 'WON' },
      });

      await tx.auctionParticipation.updateMany({
        where: {
          auctionId: auction.id,
          ...(winnerId ? { userId: { not: winnerId } } : {}),
        },
        data: { status: 'LOST' },
      });
    });

    // Kaybedenlerin teminatlarını iade et (transaction dışında — external I/O)
    const losers = auction.participations.filter(
      (p) => p.userId !== winnerId && p.holdId !== null,
    );

    for (const p of losers) {
      try {
        await this.financialGateway.refundFunds(
          p.holdId!,
          `auction-refund-${p.id}-${Date.now()}`,
        );

        await this.prisma.auctionParticipation.update({
          where: { id: p.id },
          data: { status: 'REFUNDED' },
        });

        await this.auditLog.log({
          actorId: 'SYSTEM',
          action: 'AUCTION_DEPOSIT_REFUNDED',
          resourceType: 'AuctionParticipation',
          resourceId: p.id,
          newValue: { auctionId: auction.id, holdId: p.holdId, userId: p.userId },
        });
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
        this.logger.error('Teminat iadesi başarısız', {
          participationId: p.id,
          holdId: p.holdId,
          error: msg,
        });
      }
    }

    await this.auditLog.log({
      actorId: 'SYSTEM',
      action: 'AUCTION_CLOSED',
      resourceType: 'Auction',
      resourceId: auction.id,
      newValue: {
        status: 'ENDED',
        winnerId,
        winnerAmount: topBid?.amount.toString() ?? null,
        refundedCount: losers.length,
      },
    });

    this.logger.log('Açık artırma kapatıldı', {
      auctionId: auction.id,
      winnerId,
      refundedCount: losers.length,
    });
  }
}
