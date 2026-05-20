// apps/backend/src/modules/subscription/subscription.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserSubscriptionSchema, MembershipPlanSchema, MenuUsageSchema, MenuPurchaseSchema,
  OrderSchema, ReferralSchema, UserLevelSchema, XpTransactionSchema, LoyaltyTierHistorySchema,
  MenuRightSchema,
} from '@barterborsa/shared-persistence';
import { SubscriptionController } from './presentation/subscription.controller';
import { SubscribeUserHandler } from './application/commands/subscribe-user.handler';
import { UpgradeTierHandler } from './application/commands/upgrade-tier.handler';
import { DowngradeTierHandler } from './application/commands/downgrade-tier.handler';
import { CancelSubscriptionHandler } from './application/commands/cancel-subscription.handler';
import { GetMyMembershipHandler } from './application/queries/get-my-membership.handler';
import { GetAllPlansHandler } from './application/queries/get-all-plans.handler';
import { SubscriptionPricingService } from './application/services/subscription-pricing.service';
import { SubscriptionRenewalService } from './application/services/subscription-renewal.service';
// Master Plan §2.2 + §2.7 — Menü hakkı yönetimi (tier recalc + grace).
// MenuRightsService stateless; MenuModule ↔ SubscriptionModule circular dep'i önlemek için
// her iki modüle de doğrudan provider olarak kaydediliyor.
import { MenuRightsService } from '../menu/application/services/menu-rights.service';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: 'UserSubscription',   schema: UserSubscriptionSchema },
      { name: 'MembershipPlan',     schema: MembershipPlanSchema },
      { name: 'MenuUsage',          schema: MenuUsageSchema },
      { name: 'Order',              schema: OrderSchema },
      { name: 'Referral',           schema: ReferralSchema },
      { name: 'UserLevel',          schema: UserLevelSchema },
      { name: 'XpTransaction',      schema: XpTransactionSchema },
      { name: 'LoyaltyTierHistory', schema: LoyaltyTierHistorySchema },
      { name: 'MenuRight',          schema: MenuRightSchema },
      { name: 'MenuPurchase',       schema: MenuPurchaseSchema },
    ]),
  ],
  controllers: [SubscriptionController],
  providers: [
    SubscriptionPricingService,
    SubscriptionRenewalService,
    MenuRightsService,
    SubscribeUserHandler,
    UpgradeTierHandler,
    DowngradeTierHandler,
    CancelSubscriptionHandler,
    GetMyMembershipHandler,
    GetAllPlansHandler,
  ],
  exports: [SubscriptionPricingService],
})
export class SubscriptionModule {}
