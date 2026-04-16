// apps/backend/src/modules/barter/barter.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { RabbitMQModule } from '@barterborsa/shared-messaging';
import { AcceptTradeOfferHandler } from './application/commands/accept-trade-offer.handler';
import { CreateSurplusItemHandler } from './application/commands/create-surplus-item.handler';
import { MatchingService } from './application/services/matching.service';
import { CollateralCalculatorService } from './application/services/collateral-calculator.service';
import { TradeStateMachineService } from './domain/services/trade-state-machine.service';
import { PrismaTradeOfferRepository } from './infrastructure/persistence/prisma-trade-offer.repository';
import { TradeOfferMapper } from './infrastructure/persistence/mappers/trade-offer.mapper';
import { PrismaSurplusItemRepository } from './infrastructure/persistence/prisma-surplus-item.repository';
import { SurplusItemMapper } from './infrastructure/persistence/mappers/surplus-item.mapper';
import { PrismaSwapSessionRepository } from './infrastructure/persistence/prisma-swap-session.repository';
import { SwapSessionMapper } from './infrastructure/persistence/mappers/swap-session.mapper';

@Module({
  imports: [
    CqrsModule,
    RabbitMQModule,
  ],
  providers: [
    MatchingService,
    CollateralCalculatorService,
    TradeStateMachineService,
    AcceptTradeOfferHandler,
    CreateSurplusItemHandler,
    TradeOfferMapper,
    SurplusItemMapper,
    SwapSessionMapper,
    {
      provide: 'ITradeOfferRepository',
      useClass: PrismaTradeOfferRepository,
    },
    {
       provide: 'ISurplusItemRepository',
       useClass: PrismaSurplusItemRepository,
    },
    {
      provide: 'ISwapSessionRepository',
      useClass: PrismaSwapSessionRepository,
    },
    PrismaService,
  ],
  exports: [MatchingService],
})
export class BarterModule {}
