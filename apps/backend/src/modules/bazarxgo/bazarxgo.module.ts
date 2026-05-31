// apps/backend/src/modules/bazarxgo/bazarxgo.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

// Şemalar
import {
  GoRestaurant, GoRestaurantSchema,
  GoCampaign, GoCampaignSchema,
  GoCoupon, GoCouponSchema,
  GoOrder, GoOrderSchema,
} from '@barterborsa/shared-persistence';

// Presentation
import { BazarxgoController } from './presentation/bazarxgo.controller';
import { BazarxgoOrderController } from './presentation/bazarxgo-order.controller';
import { BazarxgoAdminController } from './presentation/bazarxgo-admin.controller';

// Command handler'lar
import { PlaceGoOrderHandler } from './application/commands/place-order.handler';
import { AdvanceGoOrderStatusHandler } from './application/commands/advance-order-status.handler';
import { ValidateGoCouponHandler } from './application/commands/validate-coupon.handler';

// Servisler
import { OrderPricingService } from './application/services/order-pricing.service';
import { GoOrderSimulationScheduler } from './application/services/go-order-simulation.scheduler';
import { GoOrderSettlementService } from './application/services/go-order-settlement.service';

// WebSocket Gateway
import { GoOrderGateway } from './infrastructure/websocket/go-order.gateway';

// Infrastructure
import { MongoGoRestaurantRepository } from './infrastructure/persistence/mongo-go-restaurant.repository';
import { MongoGoOrderRepository } from './infrastructure/persistence/mongo-go-order.repository';
import { MongoGoCampaignRepository } from './infrastructure/persistence/mongo-go-campaign.repository';
import { MongoGoCouponRepository } from './infrastructure/persistence/mongo-go-coupon.repository';

// Bağımlı modüller
import { FinancialGatewayModule } from '../financial-gateway/financial-gateway.module';
import { AuditMongooseModule } from '../audit/audit-mongoose.module';

const CommandHandlers = [
  PlaceGoOrderHandler,
  AdvanceGoOrderStatusHandler,
  ValidateGoCouponHandler,
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: GoRestaurant.name, schema: GoRestaurantSchema },
      { name: GoCampaign.name,   schema: GoCampaignSchema },
      { name: GoCoupon.name,     schema: GoCouponSchema },
      { name: GoOrder.name,      schema: GoOrderSchema },
    ]),
    FinancialGatewayModule,
    AuditMongooseModule,
  ],
  controllers: [
    BazarxgoController,
    BazarxgoOrderController,
    BazarxgoAdminController,
  ],
  providers: [
    ...CommandHandlers,
    OrderPricingService,
    GoOrderGateway,
    GoOrderSimulationScheduler,
    GoOrderSettlementService,
    { provide: 'IGoRestaurantRepository', useClass: MongoGoRestaurantRepository },
    { provide: 'IGoCampaignRepository',   useClass: MongoGoCampaignRepository },
    { provide: 'IGoCouponRepository',     useClass: MongoGoCouponRepository },
    { provide: 'IGoOrderRepository',      useClass: MongoGoOrderRepository },
  ],
})
export class BazarxgoModule {}
