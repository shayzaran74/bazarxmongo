// apps/backend/src/modules/barter/barter.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@barterborsa/shared-persistence';
import { RabbitMQModule } from '@barterborsa/shared-messaging';

// Controllers
import { BarterAdminController } from './presentation/barter-admin.controller';
import { SurplusController } from './presentation/surplus.controller';
import { OffersController } from './presentation/offers.controller';
import { WantedItemsController } from './presentation/wanted-items.controller';
import { BarterController } from './presentation/barter.controller';

// Command handlers
import { AcceptTradeOfferHandler } from './application/commands/accept-trade-offer.handler';
import { CreateSurplusItemHandler } from './application/commands/create-surplus-item.handler';

// Services
import { MatchingService } from './application/services/matching.service';
import { CollateralCalculatorService } from './application/services/collateral-calculator.service';
import { TradeStateMachineService } from './domain/services/trade-state-machine.service';

// Repositories & Mappers
import { PrismaTradeOfferRepository } from './infrastructure/persistence/prisma-trade-offer.repository';
import { TradeOfferMapper } from './infrastructure/persistence/mappers/trade-offer.mapper';
import { PrismaSurplusItemRepository } from './infrastructure/persistence/prisma-surplus-item.repository';
import { SurplusItemMapper } from './infrastructure/persistence/mappers/surplus-item.mapper';
import { PrismaSwapSessionRepository } from './infrastructure/persistence/prisma-swap-session.repository';
import { SwapSessionMapper } from './infrastructure/persistence/mappers/swap-session.mapper';

@Module({
  imports: [CqrsModule, PrismaModule, RabbitMQModule],
  controllers: [
    BarterAdminController,
    SurplusController,
    OffersController,
    WantedItemsController,
    BarterController,
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
    { provide: 'ITradeOfferRepository', useClass: PrismaTradeOfferRepository },
    { provide: 'ISurplusItemRepository', useClass: PrismaSurplusItemRepository },
    { provide: 'ISwapSessionRepository', useClass: PrismaSwapSessionRepository },
  ],
  exports: [MatchingService],
})
export class BarterModule {}
