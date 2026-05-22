// apps/backend/src/modules/auction/application/services/auction-close.scheduler.ts

import { Injectable, Logger, OnModuleDestroy, OnApplicationBootstrap, Inject } from '@nestjs/common';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { IAuctionRepository } from '../../domain/repositories/auction.repository.interface';
import { IAuctionBidRepository } from '../../domain/repositories/auction-bid.repository.interface';

const CHECK_INTERVAL_MS = 60_000;

@Injectable()
export class AuctionCloseScheduler implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(AuctionCloseScheduler.name);
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(
    @Inject('IAuctionRepository') private readonly auctionRepository: IAuctionRepository,
    @Inject('IAuctionBidRepository') private readonly bidRepository: IAuctionBidRepository,
    private readonly financialGateway: FinancialGatewayService,
    private readonly auditLog: AuditLogService,
  ) {}

  onApplicationBootstrap(): void {
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

    // MongoDB'de süresi dolmuş aktif açık artırmaları bul
    const filter = { status: 'ACTIVE', endTime: { $lte: now } };
    const result = await this.auctionRepository.findWithFilters(filter, 0, 100);

    if (result.items.length === 0) return;

    this.logger.log(`Süresi dolmuş ${result.items.length} açık artırma kapatılıyor`);

    for (const auction of result.items) {
      try {
        await this.closeAuction(auction.id);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
        this.logger.error('Açık artırma kapatılamadı', { auctionId: auction.id, error: msg });
      }
    }
  }

  private async closeAuction(auctionId: string): Promise<void> {
    const auction = await this.auctionRepository.findByIdWithRelations(auctionId);
    if (!auction) return;

    const bids = auction.bids ?? [];
    const participations = auction.participations ?? [];
    const topBid = bids[0] ?? null;
    const winnerId = topBid?.userId ?? null;

    // Kazanan belirle ve winnerId'yi auction kaydına yaz
    await this.auctionRepository.updateAuctionStatus(auctionId, 'ENDED', winnerId ?? undefined);

    if (winnerId && topBid) {
      await this.auctionRepository.createWinner({
        auctionId,
        userId: winnerId,
        position: 1,
        amount: topBid.amount,
      });
    }

    // Katılımcı durumlarını toplu güncelle
    if (winnerId) {
      await this.auctionRepository.updateManyParticipations(auctionId, winnerId, 'WON');
    }
    await this.auctionRepository.updateManyParticipations(auctionId, '__none__', 'LOST');

    // Kaybedenlerin teminatlarını iade et
    type ParticipationRecord = { id: string; userId: string; status: string; holdId?: string };
    const losers = (participations as ParticipationRecord[]).filter(
      (p) => p.userId !== winnerId && p.holdId != null,
    );

    for (const p of losers) {
      if (!p.holdId) continue;
      try {
        await this.financialGateway.refundFunds(
          p.holdId,
          `auction-refund-${p.id}-${crypto.randomUUID()}`,
        );

        await this.auctionRepository.updateParticipationStatus(p.id, 'REFUNDED');

        await this.auditLog.log({
          actorId: 'SYSTEM',
          action: 'AUCTION_DEPOSIT_REFUNDED',
          resourceType: 'AuctionParticipation',
          resourceId: p.id,
          newValue: { auctionId, holdId: p.holdId, userId: p.userId },
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
      resourceId: auctionId,
      newValue: {
        status: 'ENDED',
        winnerId,
        winnerAmount: topBid ? String(topBid.amount) : null,
        refundedCount: losers.length,
      },
    });

    this.logger.log('Açık artırma kapatıldı', {
      auctionId,
      winnerId,
      refundedCount: losers.length,
    });
  }
}