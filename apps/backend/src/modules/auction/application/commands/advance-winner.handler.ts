// apps/backend/src/modules/auction/application/commands/advance-winner.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException, Inject } from '@nestjs/common';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { AdvanceWinnerCommand } from './advance-winner.command';
import { IAuctionRepository } from '../../domain/repositories/auction.repository.interface';
import { IAuctionBidRepository } from '../../domain/repositories/auction-bid.repository.interface';

@CommandHandler(AdvanceWinnerCommand)
export class AdvanceWinnerHandler implements ICommandHandler<AdvanceWinnerCommand> {
  private readonly logger = new Logger(AdvanceWinnerHandler.name);

  constructor(
    @Inject('IAuctionRepository') private readonly auctionRepository: IAuctionRepository,
    @Inject('IAuctionBidRepository') private readonly bidRepository: IAuctionBidRepository,
    private readonly auditLog: AuditLogService,
    private readonly financialGateway: FinancialGatewayService,
  ) {}

  async execute(command: AdvanceWinnerCommand) {
    const { auctionId, adminId } = command;

    const auction = await this.auctionRepository.findByIdWithRelations(auctionId);
    if (!auction) throw new NotFoundException('Açık artırma bulunamadı');

    if (!['ENDED', 'COMPLETED'].includes(auction.status)) {
      throw new BadRequestException(
        `Sıradaki kazanan yalnızca biten artırmalar için belirlenebilir (mevcut: ${auction.status})`,
      );
    }

    const previousWinner = auction.winners?.[0] ?? null;
    if (!previousWinner) {
      throw new BadRequestException('Mevcut bir kazanan yok');
    }

    // Önceki kazananları (tüm pozisyonlardaki) hariç tut
    const excludedUserIds = auction.winners?.map((w: any) => w.userId) ?? [];

    // Sıradaki en yüksek teklif sahibini bul
    const bids = await this.bidRepository.findByAuctionId(auctionId, 100);
    const nextBid = bids.find(b => !excludedUserIds.includes(b.userId));

    if (!nextBid) {
      throw new BadRequestException('Devredilebilecek başka teklif sahibi bulunamadı');
    }

    const nextPosition = previousWinner.position + 1;

    // Atomik: yeni kazanan kaydı + auction durumu güncelle + katılım statüleri
    await this.auctionRepository.createWinner({
      auctionId,
      userId: nextBid.userId,
      position: nextPosition,
      amount: nextBid.amount,
    });

    await this.auctionRepository.updateStatus(auctionId, 'ENDED');

    // Önceki kazananın katılımı LOST, yenisinin WON
    await this.auctionRepository.updateManyParticipations(auctionId, previousWinner.userId, 'LOST');
    await this.auctionRepository.updateManyParticipations(auctionId, nextBid.userId, 'WON');

    // Önceki kazananın teminatını iade et
    const previousParticipation = await this.auctionRepository.refundParticipation(
      previousWinner.auctionId,
    );

    if (previousParticipation?.holdId) {
      try {
        await this.financialGateway.refundFunds(
          previousParticipation.holdId,
          `auction-advance-refund-${previousParticipation.id}-${Date.now()}`,
        );
        await this.auctionRepository.updateParticipationStatus(previousParticipation.id, 'REFUNDED');
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
        this.logger.error('Önceki kazananın teminat iadesi başarısız', {
          participationId: previousParticipation.id,
          error: msg,
        });
      }
    }

    await this.auditLog.log({
      actorId: adminId,
      action: 'AUCTION_WINNER_ADVANCED',
      resourceType: 'Auction',
      resourceId: auctionId,
      oldValue: { winnerId: previousWinner.userId, position: previousWinner.position },
      newValue: { winnerId: nextBid.userId, position: nextPosition, amount: String(nextBid.amount) },
    });

    return {
      newWinnerId: nextBid.userId,
      position: nextPosition,
      amount: String(nextBid.amount),
    };
  }
}