// apps/backend/src/modules/menu/menu.module.ts
// BazarX Go: Restaurant + BazarXMenu DROP edildi.
// Menü modülü artık QR satın alım + redemption + abonelik kredisi takibi ile sınırlıdır.
// Restoran/menü oluşturma vendor + listing modülleri üzerinden yapılır.

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@barterborsa/shared-persistence';
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
  imports: [CqrsModule, PrismaModule, SubscriptionModule],
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
