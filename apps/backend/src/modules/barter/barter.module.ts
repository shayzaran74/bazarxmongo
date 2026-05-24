// apps/backend/src/modules/barter/barter.module.ts
// BarterModule — Mongoose migration (ADR-005 Faz 2a)

import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQModule } from '@barterborsa/shared-messaging';
import { CatalogModule } from '../catalog/catalog.module';
import { VendorModule } from '../vendor/vendor.module';
import { FinancialGatewayModule } from '../financial-gateway/financial-gateway.module';
import { MongoEcosystemMembershipRepository } from '../vendor/infrastructure/persistence/repositories/mongo-ecosystem-membership.repository';

// Schemas
import { SurplusItem, SurplusItemSchema } from '@barterborsa/shared-persistence/schemas/backend/surplusItem.schema';
import { TradeOffer, TradeOfferSchema } from '@barterborsa/shared-persistence/schemas/backend/tradeOffer.schema';
import { TradeOfferItem, TradeOfferItemSchema } from '@barterborsa/shared-persistence/schemas/backend/tradeOfferItem.schema';
import { SwapSession, SwapSessionSchema } from '@barterborsa/shared-persistence/schemas/backend/swapSession.schema';
import { BarterPart, BarterPartSchema } from '@barterborsa/shared-persistence/schemas/backend/barterPart.schema';
import { WantedItem, WantedItemSchema } from '@barterborsa/shared-persistence/schemas/backend/wantedItem.schema';
import { SurplusCategory, SurplusCategorySchema } from '@barterborsa/shared-persistence/schemas/backend/surplusCategory.schema';
import { Company, CompanySchema } from '@barterborsa/shared-persistence/schemas/backend/company.schema';
import { CategoryAttribute, CategoryAttributeSchema } from '@barterborsa/shared-persistence/schemas/backend/categoryAttribute.schema';
import { DemandMatch, DemandMatchSchema } from '@barterborsa/shared-persistence/schemas/backend/demandMatch.schema';
import { VendorB2BData, VendorB2BDataSchema } from '@barterborsa/shared-persistence/schemas/backend/vendorB2BData.schema';
import { TradeReview, TradeReviewSchema } from '@barterborsa/shared-persistence/schemas/backend/tradeReview.schema';
import { MongoBlindPoolRepository } from '../barterborsa/infrastructure/persistence/mongo-blind-pool.repository';
import { MongoVendorB2BDataRepository as BarterBorsaVendorB2BDataRepository } from '../barterborsa/infrastructure/persistence/mongo-vendor-b2b-data.repository';
import { AuditLogRepository } from '@barterborsa/shared-persistence/mongodb/audit/audit-log.repository';
import { EcosystemMembership, EcosystemMembershipSchema } from '../vendor/infrastructure/persistence/schemas/ecosystemMembership.schema';

// Controllers
import { BarterAdminController } from './presentation/barter-admin.controller';
import { SurplusController } from './presentation/surplus.controller';
import { OffersController } from './presentation/offers.controller';
import { WantedItemsController } from './presentation/wanted-items.controller';
import { BarterController } from './presentation/barter.controller';
import { TrustScoreController } from './presentation/trust-score.controller';
import { SwapSessionController } from './presentation/swap-session.controller';
import { TradeReviewController } from './presentation/trade-review.controller';

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
import { OffboardVendorHandler } from './application/commands/offboard-vendor.handler';

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
import { DisputeResolutionSchedulerService } from './application/services/dispute-resolution-scheduler.service';
import { BarterMatchScheduler } from './application/services/barter-match.scheduler';
import { SwapSchedulerService } from './application/services/swap-session.scheduler';

// Infrastructure
import { MongoSurplusItemRepository } from './infrastructure/persistence/mongo-surplus-item.repository';
import { MongoTradeOfferRepository } from './infrastructure/persistence/mongo-trade-offer.repository';
import { MongoSwapSessionRepository } from './infrastructure/persistence/mongo-swap-session.repository';
import { MongoBarterPartRepository } from './infrastructure/persistence/mongo-barter-part.repository';
import { MongoDisputeRepository } from './infrastructure/persistence/mongo-dispute.repository';
import { MongoVendorB2BDataRepository } from './infrastructure/persistence/mongo-vendor-b2b-data.repository';
import { MongoXpTransactionRepository } from './infrastructure/persistence/mongo-xp-transaction.repository';
import { MongoUserLevelRepository } from './infrastructure/persistence/mongo-user-level.repository';
import { MongoBlindPoolEntryRepository } from './infrastructure/persistence/mongo-blind-pool-entry.repository';
import { MongoWantedItemRepository } from './infrastructure/persistence/mongo-wanted-item.repository';
import { MongoCategoryRepository } from './infrastructure/persistence/mongo-category.repository';
import { SurplusItemMapper } from './infrastructure/persistence/mappers/surplus-item.mapper';
import { TradeOfferMapper } from './infrastructure/persistence/mappers/trade-offer.mapper';
import { SwapSessionMapper } from './infrastructure/persistence/mappers/swap-session.mapper';

import { AuditMongooseModule } from '../audit/audit-mongoose.module';

const CommandHandlers = [
  AcceptTradeOfferHandler,
  CreateSurplusItemHandler,
  ApproveSurplusHandler,
  RejectSurplusHandler,
  ReactivateSurplusHandler,
  RecordTrustViolationHandler,
  SubmitShippingHandler,
  ConfirmReceiptHandler,
  FinalizeSwapHandler,
  OpenDisputeHandler,
  ResolveDisputeHandler,
  RegisterBarterHandler,
  OffboardVendorHandler,
];

const QueryHandlers = [
  GetVendorTrustScoreHandler,
  GetBarterInfoHandler,
  GetMyBarterChainsHandler,
  GetMyBarterOffersHandler,
];

@Module({
  imports: [
    CqrsModule,
    RabbitMQModule,
    FinancialGatewayModule,
    MongooseModule.forFeature([
      { name: 'SurplusItem', schema: SurplusItemSchema },
      { name: 'TradeOffer', schema: TradeOfferSchema },
      { name: 'TradeOfferItem', schema: TradeOfferItemSchema },
      { name: 'SwapSession', schema: SwapSessionSchema },
      { name: 'BarterPart', schema: BarterPartSchema },
      { name: 'WantedItem', schema: WantedItemSchema },
      { name: 'SurplusCategory', schema: SurplusCategorySchema },
      { name: 'Company', schema: CompanySchema },
      { name: 'CategoryAttribute', schema: CategoryAttributeSchema },
      { name: 'DemandMatch', schema: DemandMatchSchema },
      { name: 'VendorB2BData', schema: VendorB2BDataSchema },
      { name: 'TradeReview', schema: TradeReviewSchema },
      { name: 'EcosystemMembership', schema: EcosystemMembershipSchema },
    ]),
    CatalogModule,
    forwardRef(() => VendorModule),
    AuditMongooseModule,
  ],
  controllers: [
    BarterAdminController,
    SurplusController,
    OffersController,
    WantedItemsController,
    BarterController,
    TrustScoreController,
    SwapSessionController,
    TradeReviewController,
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
    DisputeResolutionSchedulerService,
    BarterMatchScheduler,
    SwapSchedulerService,
    // Handlers
    ...CommandHandlers,
    ...QueryHandlers,
    // Mappers
    SurplusItemMapper,
    TradeOfferMapper,
    SwapSessionMapper,
    // Repositories
    { provide: 'ISurplusItemRepository', useClass: MongoSurplusItemRepository },
    { provide: 'ITradeOfferRepository', useClass: MongoTradeOfferRepository },
    { provide: 'ISwapSessionRepository', useClass: MongoSwapSessionRepository },
    { provide: 'IBarterPartRepository', useClass: MongoBarterPartRepository },
    { provide: 'IDisputeRepository', useClass: MongoDisputeRepository },
    { provide: 'IVendorB2BDataRepository', useClass: MongoVendorB2BDataRepository },
    { provide: 'IXpTransactionRepository', useClass: MongoXpTransactionRepository },
    { provide: 'IUserLevelRepository', useClass: MongoUserLevelRepository },
    { provide: 'IBlindPoolEntryRepository', useClass: MongoBlindPoolEntryRepository },
    { provide: 'IWantedItemRepository', useClass: MongoWantedItemRepository },
    { provide: 'ICategoryRepository', useClass: MongoCategoryRepository },
    MongoBlindPoolRepository,
    BarterBorsaVendorB2BDataRepository,
    AuditLogRepository,
    { provide: 'IEcosystemMembershipRepository', useClass: MongoEcosystemMembershipRepository },
  ],
  exports: [MatchingService, TrustScoreCalculatorService, WatchtowerService, 'IEcosystemMembershipRepository'],
})
export class BarterModule {}