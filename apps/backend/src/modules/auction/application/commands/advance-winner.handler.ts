// apps/backend/src/modules/auction/application/commands/advance-winner.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { AdvanceWinnerCommand } from './advance-winner.command';

@CommandHandler(AdvanceWinnerCommand)
export class AdvanceWinnerHandler implements ICommandHandler<AdvanceWinnerCommand> {
  private readonly logger = new Logger(AdvanceWinnerHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly financialGateway: FinancialGatewayService,
  ) {}

  async execute(command: AdvanceWinnerCommand) {
    const { auctionId, adminId } = command;

    const auction = await this.prisma.auction.findUnique({
      where: { id: auctionId },
      include: {
        winners: { orderBy: { position: 'desc' } },
      },
    });
    if (!auction) throw new NotFoundException('Açık artırma bulunamadı');

    if (!['ENDED', 'COMPLETED'].includes(auction.status)) {
      throw new BadRequestException(
        `Sıradaki kazanan yalnızca biten artırmalar için belirlenebilir (mevcut: ${auction.status})`,
      );
    }

    const previousWinner = auction.winners[0] ?? null;
    if (!previousWinner) {
      throw new BadRequestException('Mevcut bir kazanan yok');
    }

    // Önceki kazananları (tüm pozisyonlardaki) hariç tut
    const excludedUserIds = auction.winners.map((w) => w.userId);

    // Sıradaki en yüksek teklif sahibini bul
    const nextBid = await this.prisma.auctionBid.findFirst({
      where: {
        auctionId,
        userId: { notIn: excludedUserIds },
      },
      orderBy: { amount: 'desc' },
    });

    if (!nextBid) {
      throw new BadRequestException('Devredilebilecek başka teklif sahibi bulunamadı');
    }

    const nextPosition = previousWinner.position + 1;

    // Atomik: yeni kazanan kaydı + auction.winnerId güncelle + katılım statüleri
    await this.prisma.$transaction(async (tx) => {
      await tx.auctionWinner.create({
        data: {
          auctionId,
          userId: nextBid.userId,
          position: nextPosition,
          amount: nextBid.amount,
        },
      });

      await tx.auction.update({
        where: { id: auctionId },
        data: { winnerId: nextBid.userId, currentWinnerStep: nextPosition },
      });

      // Önceki kazananın katılımı LOST, yenisinin WON
      await tx.auctionParticipation.updateMany({
        where: { auctionId, userId: previousWinner.userId },
        data: { status: 'LOST' },
      });
      await tx.auctionParticipation.updateMany({
        where: { auctionId, userId: nextBid.userId },
        data: { status: 'WON' },
      });
    });

    // Önceki kazananın teminatını iade et (transaction dışında — external I/O)
    const previousParticipation = await this.prisma.auctionParticipation.findUnique({
      where: { auctionId_userId: { auctionId, userId: previousWinner.userId } },
    });

    if (previousParticipation?.holdId) {
      try {
        await this.financialGateway.refundFunds(
          previousParticipation.holdId,
          `auction-advance-refund-${previousParticipation.id}-${Date.now()}`,
        );
        await this.prisma.auctionParticipation.update({
          where: { id: previousParticipation.id },
          data: { status: 'REFUNDED' },
        });
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
      newValue: { winnerId: nextBid.userId, position: nextPosition, amount: nextBid.amount.toString() },
    });

    return {
      newWinnerId: nextBid.userId,
      position: nextPosition,
      amount: nextBid.amount.toString(),
    };
  }
}
