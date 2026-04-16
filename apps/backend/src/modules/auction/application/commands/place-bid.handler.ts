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

    const amount = new Prisma.Decimal(command.amount);
    
    // Domain logic: validate and update current price
    auction.placeBid(command.userId, amount);

    const bid = AuctionBid.create(auction.id, command.userId, amount);

    await this.prisma.$transaction(async (tx) => {
      await this.repository.save(auction);
      await (tx as any).auctionBid.create({
        data: {
          id: bid.id,
          auctionId: bid.getProps().auctionId,
          userId: bid.getProps().userId,
          amount: bid.getProps().amount,
        }
      });
    });

    return { success: true, currentPrice: auction.getProps().currentPrice.toString() };
  }
}
