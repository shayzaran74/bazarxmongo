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
import { TrustScoreController } from './presentation/trust-score.controller';
import { SwapSessionController } from './presentation/swap-session.controller';

// Command handlers
import { AcceptTradeOfferHandler } from './application/commands/accept-trade-offer.handler';
import { CreateSurplusItemHandler } from './application/commands/create-surplus-item.handler';
import { ApproveSurplusHandler } from './application/commands/approve-surplus.handler';
import { RejectSurplusHandler } from './application/commands/reject-surplus.handler';
import { ReactivateSurplusHandler } from './application/commands/reactivate-surplus.handler';
import { RecordTrustViolationHandler } from './application/commands/record-trust-violation.handler';
import { SubmitShippingHandler } from './application/commands/submit-shipping.handler';
import { ConfirmReceiptHandler } from './application/commands/confirm-receipt.handler';
import { FinalizeSwapHandler } from './application/commands/finalize-swap.handler';
import { OpenDisputeHandler } from './application/commands/open-dispute.handler';
import { ResolveDisputeHandler } from './application/commands/resolve-dispute.handler';
import { RegisterBarterHandler } from './application/commands/register-barter.handler';

// Query handlers
import { GetVendorTrustScoreHandler } from './application/queries/get-vendor-trust-score.handler';
import { GetBarterInfoHandler } from './application/queries/get-barter-info.handler';
import { GetMyBarterChainsHandler } from './application/queries/get-my-barter-chains.handler';
import { GetMyBarterOffersHandler } from './application/queries/get-my-barter-offers.handler';

// Services
import { MatchingService } from './application/services/matching.service';
import { CollateralCalculatorService } from './application/services/collateral-calculator.service';
import { TradeStateMachineService } from './domain/services/trade-state-machine.service';
import { TrustScoreCalculatorService } from './application/services/trust-score-calculator.service';
import { TrustScoreRecalculationService } from './application/services/trust-score-recalculation.service';
import { WatchtowerService } from './application/services/watchtower.service';
import { B2BXpRulesService } from './application/services/b2b-xp-rules.service';

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
    TrustScoreController,
    SwapSessionController,
  ],
  providers: [
    // Domain services
    MatchingService,
    CollateralCalculatorService,
    TradeStateMachineService,
    // Faz 4 services
    TrustScoreCalculatorService,
    TrustScoreRecalculationService,
    WatchtowerService,
    B2BXpRulesService,
    // Handlers
    AcceptTradeOfferHandler,
    CreateSurplusItemHandler,
    ApproveSurplusHandler,
    RejectSurplusHandler,
    ReactivateSurplusHandler,
    RecordTrustViolationHandler,
    GetVendorTrustScoreHandler,
    SubmitShippingHandler,
    ConfirmReceiptHandler,
    FinalizeSwapHandler,
    OpenDisputeHandler,
    ResolveDisputeHandler,
    RegisterBarterHandler,
    GetBarterInfoHandler,
    GetMyBarterChainsHandler,
    GetMyBarterOffersHandler,
    // Mappers
    TradeOfferMapper,
    SurplusItemMapper,
    SwapSessionMapper,
    // Repositories
    { provide: 'ITradeOfferRepository', useClass: PrismaTradeOfferRepository },
    { provide: 'ISurplusItemRepository', useClass: PrismaSurplusItemRepository },
    { provide: 'ISwapSessionRepository', useClass: PrismaSwapSessionRepository },
  ],
  exports: [MatchingService, TrustScoreCalculatorService, WatchtowerService],
})
export class BarterModule {}
