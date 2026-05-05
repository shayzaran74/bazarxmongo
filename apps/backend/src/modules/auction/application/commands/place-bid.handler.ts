// apps/backend/src/modules/auction/application/commands/place-bid.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PlaceBidCommand } from './place-bid.command';
import { IAuctionRepository } from '../../domain/repositories/auction.repository.interface';
import { AuctionBid } from '../../domain/entities/auction-bid.entity';
import { Prisma } from '@prisma/client';
import { DomainException } from '@barterborsa/shared-core';
import { PrismaService } from '@barterborsa/shared-persistence';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { AuditLogService } from '../../../audit/application/audit-log.service';

@CommandHandler(PlaceBidCommand)
export class PlaceBidHandler implements ICommandHandler<PlaceBidCommand> {
  constructor(
    @Inject('IAuctionRepository') private readonly repository: IAuctionRepository,
    private readonly prisma: PrismaService,
    private readonly financialGateway: FinancialGatewayService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: PlaceBidCommand) {
    const auction = await this.repository.findById(command.auctionId);
    if (!auction) throw new DomainException('Auction not found');

    // Teklif verenin geçerli katılım kaydı olmalı
    const participation = await this.prisma.auctionParticipation.findUnique({
      where: {
        auctionId_userId: { auctionId: command.auctionId, userId: command.userId },
      },
    });
    const geçerliDurumlar = ['DEPOSIT_HELD', 'APPROVED', 'ACTIVE'];
    if (!participation || !geçerliDurumlar.includes(participation.status)) {
      throw new DomainException('Bu açık artırmaya katılım kaydınız bulunmuyor');
    }

    const amount = new Prisma.Decimal(command.amount);

    // Cüzdan bakiyesi kontrolü
    const wallet: any = await this.financialGateway.getWallet(command.userId);
    const balance = new Prisma.Decimal(wallet.balanceTL);
    if (balance.lessThan(amount)) {
      throw new DomainException(`Yetersiz bakiye. Mevcut: ${balance.toString()} TL, Teklif: ${amount.toString()} TL`);
    }

    // Domain logic: validate and update current price
    auction.placeBid(command.userId, amount);

    const createdBid = await this.prisma.$transaction(async (tx) => {
      // 1. Önceki en yüksek teklifi bul (iade için)
      const previousBid: any = await tx.auctionBid.findFirst({
        where: { auctionId: auction.id },
        orderBy: { amount: 'desc' },
      });

      // 2. Yeni teklif için blokaj al
      const idempotencyKey = `bid-${auction.id}-${command.userId}-${command.amount}`;
      const referenceId = `bid-${auction.id}-${command.userId}`;
      const holdResult = await this.financialGateway.holdFunds(
        command.userId,
        amount.toString(),
        'AUCTION_BID',
        referenceId,
        'AUCTION_BID',
        idempotencyKey,
      );

      // 3. Önceki teklif sahibinin parasını iade et (eğer varsa ve farklı kişiyse)
      if (previousBid && previousBid.holdId) {
        await this.financialGateway.releaseFunds(
          previousBid.holdId,
          `release-bid-${previousBid.id}`
        );
      }

      // 4. Teklifi ve artırmayı kaydet
      await tx.auction.update({
        where: { id: auction.id },
        data: { 
          currentPrice: auction.getProps().currentPrice,
          updatedAt: new Date()
        }
      });

      const bid = AuctionBid.create(
        auction.id, 
        command.userId, 
        amount, 
        holdResult.holdId as string
      );

      return tx.auctionBid.create({
        data: {
          id: bid.id,
          auctionId: bid.getProps().auctionId,
          userId: bid.getProps().userId,
          amount: bid.getProps().amount,
          holdId: bid.getProps().holdId,
        } as any,
        include: {
          user: {
            select: {
              profile: { select: { firstName: true, lastName: true } }
            }
          }
        }
      });
    });

    await this.auditLog.log({
      actorId: command.userId,
      action: 'AUCTION_BID_PLACED',
      resourceType: 'Auction',
      resourceId: command.auctionId,
      newValue: {
        amount: command.amount,
        bidId: createdBid.id,
        holdId: (createdBid as any).holdId,
      },
    });

    return { 
      success: true, 
      data: createdBid,
      currentPrice: auction.getProps().currentPrice.toString() 
    };
  }
}
