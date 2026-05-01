// apps/backend/src/modules/auction/application/commands/place-bid.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PlaceBidCommand } from './place-bid.command';
import { IAuctionRepository } from '../../domain/repositories/auction.repository.interface';
import { AuctionBid } from '../../domain/entities/auction-bid.entity';
import { Prisma } from '@prisma/client';
import { DomainException } from '@barterborsa/shared-core';
import { PrismaService } from '@barterborsa/shared-persistence';

@CommandHandler(PlaceBidCommand)
export class PlaceBidHandler implements ICommandHandler<PlaceBidCommand> {
  constructor(
    @Inject('IAuctionRepository') private readonly repository: IAuctionRepository,
    private readonly prisma: PrismaService,
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

    // Domain logic: validate and update current price
    auction.placeBid(command.userId, amount);

    const bid = AuctionBid.create(auction.id, command.userId, amount);

    const createdBid = await this.prisma.$transaction(async (tx) => {
      await this.repository.save(auction);
      return tx.auctionBid.create({
        data: {
          id: bid.id,
          auctionId: bid.getProps().auctionId,
          userId: bid.getProps().userId,
          amount: bid.getProps().amount,
        },
        include: {
          user: {
            select: {
              email: true,
              profile: { select: { firstName: true, lastName: true } }
            }
          }
        }
      });
    });

    return { 
      success: true, 
      data: createdBid,
      currentPrice: auction.getProps().currentPrice.toString() 
    };
  }
}
