// apps/backend/src/modules/menu/menu.module.ts
// BazarX Go: Restaurant + BazarXMenu DROP edildi.
// Menü modülü artık QR satın alım + redemption + abonelik kredisi takibi ile sınırlıdır.
// Restoran/menü oluşturma vendor + listing modülleri üzerinden yapılır.

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MenuPurchaseSchema, MenuRedemptionSchema, LaunchPartnerSchema, ListingSchema,
  UserSubscriptionSchema, MembershipPlanSchema, MenuUsageSchema,
  UserLevelSchema, XpTransactionSchema, VendorSchema, UserProfileSchema,
} from '@barterborsa/shared-persistence';
import { SubscriptionModule } from '../subscription/subscription.module';

// Controllers
import { MenuController } from './presentation/menu.controller';
import { MenuRedeemController } from './presentation/menu-redeem.controller';

// Commands
import { PurchaseMenuHandler } from './application/commands/purchase-menu.handler';
import { ActivateOneFreeHandler } from './application/commands/activate-one-free.handler';
import { RedeemMenuHandler } from './application/commands/redeem-menu.handler';
import { AdvanceLaunchPartnerPhaseHandler } from './application/commands/advance-launch-partner-phase.handler';
import { DistributeFreeMenuHandler } from './application/commands/distribute-free-menu.handler';

// Queries
import { GetMyPurchasesHandler } from './application/queries/get-my-purchases.handler';
import { GetLaunchPartnersHandler } from './application/queries/get-launch-partners.handler';

// Services
import { QrGeneratorService } from './application/services/qr-generator.service';
import { MenuUsageTrackerService } from './application/services/menu-usage-tracker.service';

@Module({
  imports: [
    CqrsModule,
    SubscriptionModule,
    MongooseModule.forFeature([
      { name: 'MenuPurchase',    schema: MenuPurchaseSchema },
      { name: 'MenuRedemption',  schema: MenuRedemptionSchema },
      { name: 'LaunchPartner',   schema: LaunchPartnerSchema },
      { name: 'Listing',         schema: ListingSchema },
      { name: 'UserSubscription',schema: UserSubscriptionSchema },
      { name: 'MembershipPlan',  schema: MembershipPlanSchema },
      { name: 'MenuUsage',       schema: MenuUsageSchema },
      { name: 'UserLevel',       schema: UserLevelSchema },
      { name: 'XpTransaction',   schema: XpTransactionSchema },
      { name: 'Vendor',          schema: VendorSchema },
      { name: 'UserProfile',     schema: UserProfileSchema },
    ]),
  ],
  controllers: [MenuController, MenuRedeemController],
  providers: [
    QrGeneratorService,
    MenuUsageTrackerService,
    PurchaseMenuHandler,
    ActivateOneFreeHandler,
    RedeemMenuHandler,
    AdvanceLaunchPartnerPhaseHandler,
    DistributeFreeMenuHandler,
    GetMyPurchasesHandler,
    GetLaunchPartnersHandler,
  ],
  exports: [MenuUsageTrackerService],
})
export class MenuModule {}
