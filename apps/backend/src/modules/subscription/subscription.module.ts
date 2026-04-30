// apps/backend/src/modules/subscription/subscription.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@barterborsa/shared-persistence';
import { SubscriptionController } from './presentation/subscription.controller';
import { SubscribeUserHandler } from './application/commands/subscribe-user.handler';
import { UpgradeTierHandler } from './application/commands/upgrade-tier.handler';
import { CancelSubscriptionHandler } from './application/commands/cancel-subscription.handler';
import { GetMyMembershipHandler } from './application/queries/get-my-membership.handler';
import { GetAllPlansHandler } from './application/queries/get-all-plans.handler';
import { SubscriptionPricingService } from './application/services/subscription-pricing.service';
import { SubscriptionRenewalService } from './application/services/subscription-renewal.service';

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [SubscriptionController],
  providers: [
    SubscriptionPricingService,
    SubscriptionRenewalService,
    SubscribeUserHandler,
    UpgradeTierHandler,
    CancelSubscriptionHandler,
    GetMyMembershipHandler,
    GetAllPlansHandler,
  ],
  exports: [SubscriptionPricingService],
})
export class SubscriptionModule {}
