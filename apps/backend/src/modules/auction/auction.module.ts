// apps/backend/src/modules/auction/auction.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@barterborsa/shared-persistence';

import { PlaceBidHandler } from './application/commands/place-bid.handler';
import { DrawLotteryHandler } from './application/commands/draw-lottery.handler';
import { AuctionCloseScheduler } from './application/services/auction-close.scheduler';
import { LotteryDrawScheduler } from './application/services/lottery-draw.scheduler';
import { PrismaAuctionRepository } from './infrastructure/persistence/prisma-auction.repository';
import { AuctionMapper } from './infrastructure/persistence/mappers/auction.mapper';
import { PrismaLotteryRepository } from './infrastructure/persistence/prisma-lottery.repository';
import { LotteryMapper } from './infrastructure/persistence/mappers/lottery.mapper';
import { AuctionController } from './auction.controller';
import { AuctionAdminController } from './auction-admin.controller';
import { LotteryController } from './lottery.controller';
import { LotteryAdminController } from './lottery-admin.controller';

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [AuctionController, AuctionAdminController, LotteryController, LotteryAdminController],
  providers: [
    PlaceBidHandler,
    DrawLotteryHandler,
    AuctionCloseScheduler,
    LotteryDrawScheduler,
    AuctionMapper,
    LotteryMapper,
    { provide: 'IAuctionRepository', useClass: PrismaAuctionRepository },
    { provide: 'ILotteryRepository', useClass: PrismaLotteryRepository },
  ],
})
export class AuctionModule {}
