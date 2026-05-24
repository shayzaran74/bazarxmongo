// apps/backend/src/modules/menu/menu.module.ts
// BazarX-GO Sprint 4 + Düzeltmeler: FCM push, mail, geofencing, bildirim servisleri

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MenuPurchaseSchema, MenuRedemptionSchema, LaunchPartnerSchema, ListingSchema,
  UserSubscriptionSchema, MembershipPlanSchema, MenuUsageSchema,
  UserLevelSchema, XpTransactionSchema, VendorSchema, UserProfileSchema,
  MenuRightSchema, MenuReservationSchema, SurpriseMenuSchema,
  UserSchema,
} from '@barterborsa/shared-persistence';
import { NotificationSchema }     from '@barterborsa/shared-persistence/schemas/backend/notification.schema';
import { UserDeviceTokenSchema }  from '@barterborsa/shared-persistence/schemas/backend/userDeviceToken.schema';
import { GoReferralSchema }        from '@barterborsa/shared-persistence/schemas/backend/goReferral.schema';
import { GiftCardSchema }          from '@barterborsa/shared-persistence/schemas/financial/giftCard.schema';
import { GoReservationSchema }    from '@barterborsa/shared-persistence/schemas/backend/goReservation.schema';
import { SubscriptionModule } from '../subscription/subscription.module';

// Controllers
import { MenuController }        from './presentation/menu.controller';
import { MenuRedeemController }  from './presentation/menu-redeem.controller';
import { MenuAdminController }   from './presentation/menu-admin.controller';

// Commands — mevcut
import { PurchaseMenuHandler }              from './application/commands/purchase-menu.handler';
import { ActivateOneFreeHandler }            from './application/commands/activate-one-free.handler';
import { RedeemMenuHandler }                from './application/commands/redeem-menu.handler';
import { AdvanceLaunchPartnerPhaseHandler } from './application/commands/advance-launch-partner-phase.handler';
import { DistributeFreeMenuHandler }        from './application/commands/distribute-free-menu.handler';

// Commands — Sprint 1
import { TransferMenuHandler }           from './application/commands/transfer-menu.handler';
import { CreateReservationHandler }      from './application/commands/create-reservation.handler';
import { UpdateSurpriseMenuHandler }      from './application/commands/update-surprise-menu.handler';
import { RegisterGoReferralHandler }      from './application/commands/register-go-referral.handler';

// Commands — Düzeltme 3
import { CreateGiftCardOnMembershipHandler } from './application/commands/create-gift-card-on-membership.handler';

// Queries
import { GetMyPurchasesHandler }         from './application/queries/get-my-purchases.handler';
import { GetLaunchPartnersHandler }        from './application/queries/get-launch-partners.handler';
import { GetMyReferralStatusHandler }     from './application/queries/get-my-referral-status.handler';

// Services — mevcut
import { QrGeneratorService }        from './application/services/qr-generator.service';
import { MenuUsageTrackerService }   from './application/services/menu-usage-tracker.service';
import { MenuRightsService }         from './application/services/menu-rights.service';
import { MenuRightsCleanupService }   from './application/services/menu-rights-cleanup.service';
import { MenuCronService }           from './application/services/menu-cron.service';

// Services — Sprint 4
import { GoNotificationService }  from './application/services/go-notification.service';
import { GeofenceService }        from './application/services/geofence.service';
import { FcmService }             from '../communication/infrastructure/push/fcm.service';
import { MailService }           from '../communication/infrastructure/mail/mail.service';

// Services — Düzeltme 4
import { CategoryAccessService } from './application/services/category-access.service';

// Services — Faz 5
import { GoFcmService } from './infrastructure/fcm/go-fcm.service';

// Jobs — Faz 5
import { GoNotificationProcessor } from './application/jobs/go-notification.processor';

@Module({
  imports: [
    CqrsModule,
    SubscriptionModule,
    MongooseModule.forFeature([
      { name: 'MenuPurchase',     schema: MenuPurchaseSchema },
      { name: 'MenuRedemption',  schema: MenuRedemptionSchema },
      { name: 'MenuReservation',  schema: MenuReservationSchema },
      { name: 'SurpriseMenu',     schema: SurpriseMenuSchema },
      { name: 'LaunchPartner',    schema: LaunchPartnerSchema },
      { name: 'Listing',          schema: ListingSchema },
      { name: 'UserSubscription', schema: UserSubscriptionSchema },
      { name: 'MembershipPlan',  schema: MembershipPlanSchema },
      { name: 'MenuUsage',        schema: MenuUsageSchema },
      { name: 'UserLevel',        schema: UserLevelSchema },
      { name: 'XpTransaction',    schema: XpTransactionSchema },
      { name: 'Vendor',           schema: VendorSchema },
      { name: 'UserProfile',      schema: UserProfileSchema },
      { name: 'MenuRight',        schema: MenuRightSchema },
      // Sprint 4
      { name: 'Notification',     schema: NotificationSchema },
      { name: 'UserDeviceToken',  schema: UserDeviceTokenSchema },
      // Referans sistemi
      { name: 'GoReferral',       schema: GoReferralSchema },
      // Düzeltme 3: Hediye kartı
      { name: 'GiftCard',         schema: GiftCardSchema },
      // Faz 7: Rezervasyon
      { name: 'GoReservation',    schema: GoReservationSchema },
      // Faz 5: User — GoFcmService için
      { name: 'User',           schema: UserSchema },
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
    // Sprint 4 services
    FcmService,
    MailService,
    GoNotificationService,
    GeofenceService,
    // Düzeltme 4: Category Access
    CategoryAccessService,
    // Faz 5: GO FCM
    GoFcmService,
    // Command Handlers
    PurchaseMenuHandler,
    ActivateOneFreeHandler,
    RedeemMenuHandler,
    AdvanceLaunchPartnerPhaseHandler,
    DistributeFreeMenuHandler,
    TransferMenuHandler,
    CreateReservationHandler,
    UpdateSurpriseMenuHandler,
    RegisterGoReferralHandler,
    // Düzeltme 3
    CreateGiftCardOnMembershipHandler,
    // Query Handlers
    GetMyPurchasesHandler,
    GetLaunchPartnersHandler,
    GetMyReferralStatusHandler,
    // Faz 5: Jobs
    GoNotificationProcessor,
  ],
  exports: [
    MenuUsageTrackerService,
    MenuRightsService,
    GoNotificationService,
    CategoryAccessService,
  ],
})
export class MenuModule {}