// apps/backend/src/modules/auction/auction.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { PlaceBidHandler } from './application/commands/place-bid.handler';
import { DrawLotteryHandler } from './application/commands/draw-lottery.handler';
import { PrismaAuctionRepository } from './infrastructure/persistence/prisma-auction.repository';
import { AuctionMapper } from './infrastructure/persistence/mappers/auction.mapper';
import { PrismaLotteryRepository } from './infrastructure/persistence/prisma-lottery.repository';
import { LotteryMapper } from './infrastructure/persistence/mappers/lottery.mapper';
import { AuctionController } from './auction.controller';
import { LotteryController } from './lottery.controller';

@Module({
  imports: [CqrsModule],
  controllers: [AuctionController, LotteryController],
  providers: [
    PlaceBidHandler,
    DrawLotteryHandler,
    PrismaService,
    AuctionMapper,
    LotteryMapper,
    {
      provide: 'IAuctionRepository',
      useClass: PrismaAuctionRepository,
    },
    {
      provide: 'ILotteryRepository',
      useClass: PrismaLotteryRepository,
    }
  ],
})
export class AuctionModule {}
