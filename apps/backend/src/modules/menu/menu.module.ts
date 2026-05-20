// apps/backend/src/modules/menu/menu.module.ts
// BazarX-GO Sprint 1: Devir, Rezervasyon, Sürpriz Menü, Cron job'lar eklendi

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MenuPurchaseSchema, MenuRedemptionSchema, LaunchPartnerSchema, ListingSchema,
  UserSubscriptionSchema, MembershipPlanSchema, MenuUsageSchema,
  UserLevelSchema, XpTransactionSchema, VendorSchema, UserProfileSchema,
  MenuRightSchema, MenuReservationSchema, SurpriseMenuSchema,
} from '@barterborsa/shared-persistence';
import { SubscriptionModule } from '../subscription/subscription.module';

// Controllers
import { MenuController }      from './presentation/menu.controller';
import { MenuRedeemController } from './presentation/menu-redeem.controller';
import { MenuAdminController }  from './presentation/menu-admin.controller';

// Commands — mevcut
import { PurchaseMenuHandler }            from './application/commands/purchase-menu.handler';
import { ActivateOneFreeHandler }          from './application/commands/activate-one-free.handler';
import { RedeemMenuHandler }              from './application/commands/redeem-menu.handler';
import { AdvanceLaunchPartnerPhaseHandler } from './application/commands/advance-launch-partner-phase.handler';
import { DistributeFreeMenuHandler }      from './application/commands/distribute-free-menu.handler';

// Commands — Sprint 1 yeni
import { TransferMenuHandler }     from './application/commands/transfer-menu.handler';
import { CreateReservationHandler } from './application/commands/create-reservation.handler';
import { UpdateSurpriseMenuHandler } from './application/commands/update-surprise-menu.handler';

// Queries
import { GetMyPurchasesHandler }   from './application/queries/get-my-purchases.handler';
import { GetLaunchPartnersHandler } from './application/queries/get-launch-partners.handler';

// Services
import { QrGeneratorService }      from './application/services/qr-generator.service';
import { MenuUsageTrackerService } from './application/services/menu-usage-tracker.service';
import { MenuRightsService }       from './application/services/menu-rights.service';
import { MenuRightsCleanupService } from './application/services/menu-rights-cleanup.service';
import { MenuCronService }         from './application/services/menu-cron.service';

@Module({
  imports: [
    CqrsModule,
    SubscriptionModule,
    MongooseModule.forFeature([
      { name: 'MenuPurchase',    schema: MenuPurchaseSchema },
      { name: 'MenuRedemption',  schema: MenuRedemptionSchema },
      { name: 'MenuReservation', schema: MenuReservationSchema },
      { name: 'SurpriseMenu',    schema: SurpriseMenuSchema },
      { name: 'LaunchPartner',   schema: LaunchPartnerSchema },
      { name: 'Listing',         schema: ListingSchema },
      { name: 'UserSubscription',schema: UserSubscriptionSchema },
      { name: 'MembershipPlan',  schema: MembershipPlanSchema },
      { name: 'MenuUsage',       schema: MenuUsageSchema },
      { name: 'UserLevel',       schema: UserLevelSchema },
      { name: 'XpTransaction',   schema: XpTransactionSchema },
      { name: 'Vendor',          schema: VendorSchema },
      { name: 'UserProfile',     schema: UserProfileSchema },
      { name: 'MenuRight',       schema: MenuRightSchema },
    ]),
  ],
  controllers: [MenuController, MenuRedeemController, MenuAdminController],
  providers: [
    // Services
    QrGeneratorService,
    MenuUsageTrackerService,
    MenuRightsService,
    MenuRightsCleanupService,
    MenuCronService,
    // Command Handlers
    PurchaseMenuHandler,
    ActivateOneFreeHandler,
    RedeemMenuHandler,
    AdvanceLaunchPartnerPhaseHandler,
    DistributeFreeMenuHandler,
    TransferMenuHandler,
    CreateReservationHandler,
    UpdateSurpriseMenuHandler,
    // Query Handlers
    GetMyPurchasesHandler,
    GetLaunchPartnersHandler,
  ],
  exports: [MenuUsageTrackerService, MenuRightsService],
})
export class MenuModule {}
