// apps/backend/src/modules/auction/auction.module.ts
// AuctionModule — Mongoose migration (ADR-005 Faz 2a)

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogModule } from '../catalog/catalog.module';

// Schemas
import { Auction, AuctionSchema } from '@barterborsa/shared-persistence/schemas/backend/auction.schema';
import { AuctionBid, AuctionBidSchema } from '@barterborsa/shared-persistence/schemas/backend/auctionBid.schema';
import { AuctionParticipation, AuctionParticipationSchema } from '@barterborsa/shared-persistence/schemas/backend/auctionParticipation.schema';
import { Lottery, LotterySchema } from '@barterborsa/shared-persistence/schemas/backend/lottery.schema';
import { LotteryTicket, LotteryTicketSchema } from '@barterborsa/shared-persistence/schemas/backend/lotteryTicket.schema';

// Controllers
import { AuctionController } from './auction.controller';
import { AuctionAdminController } from './auction-admin.controller';
import { LotteryController } from './lottery.controller';
import { LotteryAdminController } from './lottery-admin.controller';

// Command handlers
import { PlaceBidHandler } from './application/commands/place-bid.handler';
import { DrawLotteryHandler } from './application/commands/draw-lottery.handler';
import { AdvanceWinnerHandler } from './application/commands/advance-winner.handler';

// Services
import { AuctionCloseScheduler } from './application/services/auction-close.scheduler';
import { LotteryDrawScheduler } from './application/services/lottery-draw.scheduler';

// Infrastructure
import { MongoAuctionRepository } from './infrastructure/persistence/mongo-auction.repository';
import { MongoLotteryRepository } from './infrastructure/persistence/mongo-lottery.repository';
import { MongoAuctionBidRepository } from './infrastructure/persistence/mongo-auction-bid.repository';
import { MongoAuctionParticipationRepository } from './infrastructure/persistence/mongo-auction-participation.repository';
import { AuctionMapper } from './infrastructure/persistence/mappers/auction.mapper';
import { LotteryMapper } from './infrastructure/persistence/mappers/lottery.mapper';

const CommandHandlers = [
  PlaceBidHandler,
  DrawLotteryHandler,
  AdvanceWinnerHandler,
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Auction.name, schema: AuctionSchema },
      { name: AuctionBid.name, schema: AuctionBidSchema },
      { name: AuctionParticipation.name, schema: AuctionParticipationSchema },
      { name: Lottery.name, schema: LotterySchema },
      { name: LotteryTicket.name, schema: LotteryTicketSchema },
    ]),
    CatalogModule,
  ],
  controllers: [AuctionController, AuctionAdminController, LotteryController, LotteryAdminController],
  providers: [
    ...CommandHandlers,
    AuctionCloseScheduler,
    LotteryDrawScheduler,
    AuctionMapper,
    LotteryMapper,
    { provide: 'IAuctionRepository', useClass: MongoAuctionRepository },
    { provide: 'ILotteryRepository', useClass: MongoLotteryRepository },
    { provide: 'IAuctionBidRepository', useClass: MongoAuctionBidRepository },
    { provide: 'IAuctionParticipationRepository', useClass: MongoAuctionParticipationRepository },
  ],
})
export class AuctionModule {}